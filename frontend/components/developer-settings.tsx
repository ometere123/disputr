import { Activity, AlertCircle, Copy, Eye, KeyRound, TrendingUp, Webhook } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiKeys } from "@/lib/demo-data";

export function DeveloperSettings() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
      <div className="min-w-0 space-y-8">
        <Card className="min-w-0 p-8">
          <div className="flex items-center gap-5">
            <div className="rounded-xl bg-[#fff1eb] p-4 text-primary">
              <KeyRound className="size-7" />
            </div>
            <h2 className="text-3xl font-extrabold">Active API Keys</h2>
          </div>
          <div className="mt-8 overflow-x-auto">
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
                {apiKeys.map((key) => (
                  <tr key={key.name} className="border-b border-border last:border-b-0">
                    <td className="py-5 pr-3 text-base">{key.name}</td>
                    <td className="py-5 pr-3 font-mono text-sm">
                      {key.token}
                      <Copy className="ml-2 inline size-4 text-muted-foreground" />
                    </td>
                    <td className="space-y-2 py-5 pr-3">
                      {key.scopes.map((scope) => (
                        <div key={scope}>
                          <Badge>{scope}</Badge>
                        </div>
                      ))}
                    </td>
                    <td className="py-5 pr-3 text-muted-foreground">{key.created}</td>
                    <td className="py-5 text-primary">Rotate</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase text-muted-foreground">Requests / Month</p>
              <TrendingUp className="size-6 text-[#d1b88e]" />
            </div>
            <p className="mt-10 text-6xl font-extrabold">45.2k</p>
            <p className="mt-3 font-semibold text-[#176d44]">12% vs last month</p>
          </Card>
          <Card className="p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase text-muted-foreground">Error Rate</p>
              <AlertCircle className="size-6 text-[#e7cfc7]" />
            </div>
            <p className="mt-10 text-6xl font-extrabold">0.04%</p>
            <p className="mt-3 flex items-center gap-2 font-semibold text-[#176d44]">
              <Activity className="size-4" />
              Healthy status
            </p>
          </Card>
        </div>
      </div>

      <Card className="min-w-0 p-8">
        <div className="flex items-center gap-5">
          <div className="rounded-xl bg-[#fff1eb] p-4 text-primary">
            <Webhook className="size-7" />
          </div>
          <h2 className="text-3xl font-extrabold">Webhooks</h2>
        </div>
        <p className="mt-8 text-lg leading-8 text-muted-foreground">
          Receive real-time HTTP POST notifications when events occur in your disputes.
        </p>
        <label className="mt-8 block">
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
            <span className="font-mono text-muted-foreground">whsec_x8j9...2k1m</span>
            <Eye className="ml-auto size-5 text-muted-foreground" />
          </div>
        </label>
        <div className="mt-8 border-t border-border pt-8">
          <Button className="w-full" variant="outline">
            Save Configuration
          </Button>
        </div>
      </Card>
    </div>
  );
}
