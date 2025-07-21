import { useEffect } from "react";
import { useLocation } from "react-router";

declare global {
    interface Window {
        gtag: (
            command: "config" | "event" | "js" | "set",
            targetId: string | Date,
            config?: Record<string, any>
        ) => void;
    }
}

interface GoogleAnalyticsProps {
    trackingId: string;
}

export function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
    const location = useLocation();

    useEffect(() => {
        if (typeof window !== "undefined" && window.gtag) {
            window.gtag("config", trackingId, {
                page_path: location.pathname + location.search,
            });
        }
    }, [location, trackingId]);

    return null;
}

export function GoogleAnalyticsScripts({ trackingId }: GoogleAnalyticsProps) {
    return (
        <>
            <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
            />
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}', {
              page_path: window.location.pathname,
            });
          `,
                }}
            />
        </>
    );
}