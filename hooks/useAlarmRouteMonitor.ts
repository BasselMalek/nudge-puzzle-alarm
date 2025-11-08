// hooks/useAlarmRouteMonitor.ts
import { useLayoutEffect, useRef, useState } from "react";
import { usePathname, useSegments } from "expo-router";

interface RouteSnapshot {
    pathname: string;
    segments: string;
    timestamp: string;
}

export function useAlarmRouteMonitor(url: string | null) {
    const pathname = usePathname();
    const segments = useSegments();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const routeHistoryRef = useRef<RouteSnapshot[]>([]);

    useLayoutEffect(() => {
        // Track route changes
        if (timeoutRef.current) {
            routeHistoryRef.current.push({
                pathname,
                segments: segments.join("/"),
                timestamp: new Date().toISOString(),
            });
        }

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Check if URL matches alarm pattern
        if (url && url.match(/nudge:\/\/alarms\/([^/?#]+)/)) {
            const alarmMatch = url.match(/nudge:\/\/alarms\/([^/?#]+)/);
            const alarmId = alarmMatch ? alarmMatch[1] : "unknown";

            // Reset history
            routeHistoryRef.current = [
                {
                    pathname,
                    segments: segments.join("/"),
                    timestamp: new Date().toISOString(),
                },
            ];

            console.log(
                "NUDGE_DEBUG: Alarm URL detected, starting 10s monitor...",
                {
                    url,
                    alarmId,
                    initialRoute: pathname,
                    initialSegments: segments.join("/"),
                    startTime: new Date().toISOString(),
                }
            );

            // Start 10-second timeout
            timeoutRef.current = setTimeout(() => {
                const expectedRoute = `/alarms/${alarmId}`;
                const actualRoute = pathname;
                const routeMatches = actualRoute === expectedRoute;

                console.log("NUDGE_DEBUG: === 10-SECOND ROUTE CHECK ===", {
                    alarmId,
                    expectedRoute,
                    actualRoute,
                    actualSegments: segments.join("/"),
                    routeMatches,
                    success: routeMatches,
                    routeHistory: routeHistoryRef.current,
                    totalRouteChanges: routeHistoryRef.current.length,
                    endTime: new Date().toISOString(),
                });

                if (!routeMatches) {
                    console.warn("NUDGE_DEBUG: ⚠️ ROUTE MISMATCH DETECTED!", {
                        expected: expectedRoute,
                        actual: actualRoute,
                        possibleIssue: "Navigation may have failed",
                    });
                } else {
                    console.log("NUDGE_DEBUG: ✅ Route successfully navigated");
                }

                // Clear history
                routeHistoryRef.current = [];
            }, 10000);
        }

        // Cleanup on unmount or URL change
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [url, pathname, segments]);
}
