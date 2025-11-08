export function redirectSystemPath({
    path,
    initial,
}: {
    path: string;
    initial: boolean;
}) {
    try {
        console.log(
            `NUDGE_DEBUG: From +native-intent. Incoming with ${path} as ${
                initial ? "initial" : "repeated"
            }.`
        );
        const url = new URL(path, "nudge://");
        if (url.hostname === "alarms") {
            console.log(`NUDGE_DEBUG: Received alarm with id: ${url.pathname}`);
            return `/alarms${url.pathname}`;
        }
        console.log("NUDGE_DEBUG: Didn't get alarm.");
        return path;
    } catch (e) {
        console.log("NUDGE_DEBUG: Crashed here because " + e);
        return "/";
    }
}
