import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { NotificationType } from "@/lib/notifications";

export function getNotificationUi(type: NotificationType) {
  if (type === "success") {
    return {
      icon: CheckCircle2,
      color: "bg-emerald-100",
      iconColor: "text-emerald-600",
    };
  }

  if (type === "alert") {
    return {
      icon: AlertCircle,
      color: "bg-rose-100",
      iconColor: "text-rose-600",
    };
  }

  return {
    icon: Info,
    color: "bg-blue-100",
    iconColor: "text-blue-600",
  };
}
