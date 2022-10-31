import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "../components/loader";
import styles from "../styles/index.module.css";

export default function Home() {
  const [presentation, setPresentation] = useState();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [url, setUrl] = useState("");

  const timerRef = useRef(null);

  // Clear the timeout
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  // Step 2, check the backed if we received a presentation
  const pollForPresentation = useCallback(async (request_id) => {
    try {
      const res = await fetch(`/api/verify/check`, {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id,
        }),
      });
      const data = await res.json();

      // presentation is received and verified
      if (data.status === "verified") {
        return data;
      } else {
        // other statuses, like 'initiated', which means the user
        // started the process
        setStatus(data.status);

        // pause for a bit
        await new Promise((resolve) => {
          timerRef.current = setTimeout(resolve, 1000);
        });

        // then recheck
        return pollForPresentation(request_id);
      }
    } catch (err) {
      console.log("Error during check:", err);
    }
  }, []);

  const onClick = useCallback(async () => {
    reset();
    setLoading(true);
    try {
      // Step 1, start the presentation flow
      const res = await fetch(`/api/verify/start`);
      const { url, request_id } = await res.json();

      // walletUrl would normally be encoded into a QR code that a user
      // would scan with the wallet app.
      const walletUrl = url.replace("openid://", "https://wallet.verifiablecredentials.dev/siop");
      setUrl(walletUrl);

      // Start polling for a result. This happens once the user
      // follows the walletUrl link and presents a credential from ID Walelt
      const { presentation } = await pollForPresentation(request_id);

      setPresentation(presentation);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [pollForPresentation]);

  const reset = () => {
    setLoading(false);
    setPresentation();
    setUrl("");
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Verifier App Demo</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Credential Verification</h1>
        <div className={styles.loaderContainer}>
          {loading ? (
            <Loader />
          ) : (
            <button className={styles.button} onClick={onClick}>
              Start Presentation Flow
            </button>
          )}
        </div>
        {url && !presentation && (
          <p>
            Click{" "}
            <a href={url} target="_blank" rel="noreferrer">
              HERE
            </a>{" "}
            to open wallet and preset your credential
          </p>
        )}
        {url && !presentation ? (
          <p>
            Status: <code>{status}</code>
          </p>
        ) : null}

        {presentation && (
          <div className={styles.presentation}>
            <pre>{JSON.stringify(presentation, null, 4)} </pre>
          </div>
        )}
        {url && (
          <button className={styles.reset} onClick={reset}>
            Reset
          </button>
        )}
      </main>
    </div>
  );
}
