import { Metadata } from "next";
import ReplyHelperClient from "./reply-helper-client";

export const metadata: Metadata = {
  title: "Reply Helper | Internal — The Skin Atelier",
  description: "X リプライ作成支援ツール（内部利用）",
  robots: { index: false, follow: false },
};

export default function ReplyHelperPage() {
  return <ReplyHelperClient />;
}
