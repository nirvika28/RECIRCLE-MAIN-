"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Send, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ShareDialog({
  open,
  onOpenChange,
  url,
  title = "Share",
}: {
  open: boolean
  onOpenChange: (value: boolean) => void
  url: string
  title?: string
}) {
  const [link] = useState(url)
  const { toast } = useToast()

  function copy() {
    navigator.clipboard.writeText(link)
    toast({ title: "Link copied" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <a
              className="rounded-md border p-3 text-center hover:bg-muted"
              target="_blank"
              rel="noreferrer"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`}
            >
              <Facebook className="mx-auto h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a
              className="rounded-md border p-3 text-center hover:bg-muted"
              target="_blank"
              rel="noreferrer"
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(title)}`}
            >
              <Twitter className="mx-auto h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              className="rounded-md border p-3 text-center hover:bg-muted"
              target="_blank"
              rel="noreferrer"
              href={`https://www.instagram.com/?url=${encodeURIComponent(link)}`}
            >
              <Instagram className="mx-auto h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a
              className="rounded-md border p-3 text-center hover:bg-muted"
              target="_blank"
              rel="noreferrer"
              href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(title)}`}
            >
              <Send className="mx-auto h-5 w-5" />
              <span className="sr-only">Telegram</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Input readOnly value={link} />
            <Button variant="outline" onClick={copy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
