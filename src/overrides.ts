import { Endpoint } from "./types.js";

export const EXTENDED_HELP_FUNCTION_OVERRIDES: Record<string, Partial<Endpoint>> = {
    "Help": {
        method: "post",
        path: "/Help"
    },
    "Subscribe": {
        method: "post",
        path: "/Subscribe"
    },
    "Unsubscribe": {
        method: "post",
        path: "/Unsubscribe"
    },
    "AsyncDelete": {
        method: "post",
        path: "/AsyncDelete"
    },
    "AsyncResult": {
        method: "post",
        path: "/AsyncResult"
    },
    "AsyncStatus": {
        method: "post",
        path: "/AsyncStatus"
    },
    "Cancel": {
        method: "post",
        path: "/Cancel"
    },
    "Exit": {
        method: "post",
        path: "/Exit"
    },
    "WebSocketFormat": {
        method: "post",
        path: "/WebSocketFormat"
    },
    "LoggingGetEntries": {
        method: "post",
        path: "/LoggingGetEntries"
    },
    "LoggingMetrics": {
        method: "post",
        path: "/LoggingMetrics"
    },
    "LoggingMetricsMetadata": {
        method: "post",
        path: "/LoggingMetricsMetadata"
    },
    "LoggingStart": {
        method: "post",
        path: "/LoggingStart"
    },
    "LoggingStop": {
        method: "post",
        path: "/LoggingStop"
    },
}