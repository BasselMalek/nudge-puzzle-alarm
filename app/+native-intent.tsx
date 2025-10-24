export function redirectSystemPath({
    path,
    initial,
}: {
    path: string;
    initial: boolean;
}) {
    try {
        console.log("From +native-intent ");
        const url = new URL(path, "nudge://");
        if (url.hostname === "alarms") {
            console.log(`Received alarm with id: ${url.pathname}`);
            return `/alarms${url.pathname}`;
        }
        console.log("Didn't get alarm.");
        return path;
    } catch (e) {
        console.log("Crashed here because " + e);
        return "/";
    }
}
