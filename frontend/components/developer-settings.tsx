import { Activity, AlertCircle, Eye, KeyRound, TrendingUp, Webhook } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function DeveloperSettings() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
      <div className="min-w-0 space-y-6">
        <Card className="min-w-0 p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[#fff1eb] p-3 text-primary">
              <KeyRound className="size-6" />
            </div>
            <h2 className="text-2xl font-extrabold">Active API Keys</h2>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[26%]" />
                <col className="w-[23%]" />
                <col className="w-[17%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead className="border-b border-border text-sm font-semibold text-muted-foreground">
                <tr>
                  <th className="py-4">Key Name</th>
                  <th className="py-4">Token</th>
                  <th className="py-4">Scopes</th>
                  <th className="py-4">Created</th>
                  <th className="py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <p className="font-bold text-primary">No API keys yet</p>
                    <p className="mt-2 text-muted-foreground">
                      Generated `dk_` keys from the database will appear here once created.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase text-muted-foreground">Requests / Month</p>
              <TrendingUp className="size-5 text-[#d1b88e]" />
            </div>
            <p className="mt-6 text-4xl font-extrabold">0</p>
            <p className="mt-3 font-semibold text-muted-foreground">No API traffic recorded</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase text-muted-foreground">Error Rate</p>
              <AlertCircle className="size-5 text-[#e7cfc7]" />
            </div>
            <p className="mt-6 text-4xl font-extrabold">0%</p>
            <p className="mt-3 flex items-center gap-2 font-semibold text-muted-foreground">
              <Activity className="size-4" />
              No webhook deliveries recorded
            </p>
          </Card>
        </div>
      </div>

      <Card className="min-w-0 p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-[#fff1eb] p-3 text-primary">
            <Webhook className="size-6" />
          </div>
          <h2 className="text-2xl font-extrabold">Webhooks</h2>
        </div>
        <p className="mt-6 leading-7 text-muted-foreground">
          Receive real-time HTTP POST notifications when events occur in your disputes.
        </p>
        <label className="mt-6 block">
          <span className="font-semibold">Endpoint URL</span>
          <Input className="mt-3" placeholder="https://api.yoursite.com/webhooks/disputr" />
        </label>
        <div className="mt-6 space-y-3">
          <p className="font-semibold">Events to send</p>
          {["dispute.created", "verdict.delivered", "appeal.initiated"].map((event, index) => (
            <label key={event} className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-4">
              <Checkbox defaultChecked={index === 1} disabled={event !== "verdict.delivered"} />
              <span>{event}</span>
            </label>
          ))}
        </div>
        <label className="mt-6 block">
          <span className="font-semibold">Signing Secret</span>
          <div className="mt-3 flex items-center gap-3 rounded-md border border-input bg-[#f6e9df] px-4 py-3">
            <span className="font-mono text-muted-foreground">Generated after saving</span>
            <Eye className="ml-auto size-5 text-muted-foreground" />
          </div>
        </label>
        <div className="mt-6 border-t border-border pt-6">
          <Button className="w-full" variant="outline">
            Save Configuration
          </Button>
        </div>
      </Card>
    </div>
  );
}
