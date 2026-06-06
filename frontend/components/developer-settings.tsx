"use client";

import { Activity, AlertCircle, Code2, Copy, KeyRound, Loader2, Send, Trash2, TrendingUp, Webhook } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DISPUTR_API_URL } from "@/config/app";

const availableScopes = ["read:verdicts", "write:disputes", "read:credentials", "write:webhooks"] as const;

type ApiKeyRow = {
  id: string;
  label: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  revokedAt: string | null;
};

type WebhookRow = {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  secretHint: string;
};

type DeliveryRow = {
  id: string;
  webhookId: string;
  webhookUrl: string;
  event: string;
  status: string;
  attempts: number;
  createdAt: string;
  updatedAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

export function DeveloperSettings() {
  const [apiKeys, setApiKeys] = React.useState<ApiKeyRow[]>([]);
  const [webhooks, setWebhooks] = React.useState<WebhookRow[]>([]);
  const [deliveries, setDeliveries] = React.useState<DeliveryRow[]>([]);
  const [keyLabel, setKeyLabel] = React.useState("Production key");
  const [selectedScopes, setSelectedScopes] = React.useState<string[]>(["read:verdicts", "write:disputes"]);
  const [endpointUrl, setEndpointUrl] = React.useState("");
  const [plaintextKey, setPlaintextKey] = React.useState("");
  const [signingSecret, setSigningSecret] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreatingKey, setIsCreatingKey] = React.useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = React.useState(false);
  const [testingWebhookId, setTestingWebhookId] = React.useState("");

  async function loadDeveloperData() {
    setIsLoading(true);
    setError("");

    try {
      const [keysResponse, webhooksResponse, deliveriesResponse] = await Promise.all([
        fetch("/api/me/api-keys", { cache: "no-store" }),
        fetch("/api/me/webhooks", { cache: "no-store" }),
        fetch("/api/me/webhook-deliveries", { cache: "no-store" })
      ]);

      if (keysResponse.status === 401 || webhooksResponse.status === 401 || deliveriesResponse.status === 401) {
        setError("Sign in to manage developer settings.");
        return;
      }

      if (!keysResponse.ok || !webhooksResponse.ok || !deliveriesResponse.ok) {
        throw new Error("Developer data load failed.");
      }

      const keysData = (await keysResponse.json()) as { apiKeys: ApiKeyRow[] };
      const webhooksData = (await webhooksResponse.json()) as { webhooks: WebhookRow[] };
      const deliveriesData = (await deliveriesResponse.json()) as { deliveries: DeliveryRow[] };
      setApiKeys(keysData.apiKeys);
      setWebhooks(webhooksData.webhooks);
      setDeliveries(deliveriesData.deliveries);
    } catch {
      setError("Could not load developer settings.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    void loadDeveloperData();
  }, []);

  function toggleScope(scope: string, checked: boolean) {
    setSelectedScopes((current) => (checked ? [...new Set([...current, scope])] : current.filter((item) => item !== scope)));
  }

  async function createApiKey() {
    setError("");
    setStatus("");
    setPlaintextKey("");
    setIsCreatingKey(true);

    try {
      const response = await fetch("/api/me/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: keyLabel, scopes: selectedScopes, environment: "live" })
      });

      if (!response.ok) {
        throw new Error("API key creation failed.");
      }

      const data = (await response.json()) as { plaintext: string };
      setPlaintextKey(data.plaintext);
      setStatus("API key created. Copy it now; it will not be shown again.");
      await loadDeveloperData();
    } catch {
      setError("Could not create API key.");
    } finally {
      setIsCreatingKey(false);
    }
  }

  async function revokeApiKey(id: string) {
    setError("");
    const response = await fetch(`/api/me/api-keys/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not revoke API key.");
      return;
    }

    await loadDeveloperData();
  }

  async function saveWebhook() {
    setError("");
    setStatus("");
    setSigningSecret("");
    setIsSavingWebhook(true);

    try {
      const response = await fetch("/api/me/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: endpointUrl, events: ["verdict.delivered"] })
      });

      if (!response.ok) {
        throw new Error("Webhook save failed.");
      }

      const data = (await response.json()) as { signingSecret: string };
      setSigningSecret(data.signingSecret);
      setEndpointUrl("");
      setStatus("Webhook saved. Copy the signing secret now.");
      await loadDeveloperData();
    } catch {
      setError("Could not save webhook. Endpoint must be a valid HTTPS URL.");
    } finally {
      setIsSavingWebhook(false);
    }
  }

  async function deleteWebhook(id: string) {
    setError("");
    const response = await fetch(`/api/me/webhooks/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete webhook.");
      return;
    }

    await loadDeveloperData();
  }

  async function testWebhook(id: string) {
    setError("");
    setStatus("");
    setTestingWebhookId(id);

    try {
      const response = await fetch(`/api/me/webhooks/${id}/test`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; statusCode?: number; statusText?: string };

      if (!response.ok) {
        throw new Error("Webhook test failed.");
      }

      setStatus(
        data.ok
          ? `Test webhook delivered with HTTP ${data.statusCode}.`
          : `Test webhook sent, but the endpoint returned ${data.statusCode || data.statusText || "an error"}.`
      );
      await loadDeveloperData();
    } catch {
      setError("Could not send test webhook.");
    } finally {
      setTestingWebhookId("");
    }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setStatus("Copied.");
  }

  const curlSnippet = `curl -X POST ${DISPUTR_API_URL}/v1/dispute \\
  -H "Authorization: Bearer ${plaintextKey || "dk_live_your_key"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "escrow_address": "0x1111111111111111111111111111111111111111",
    "claimant": "0x2222222222222222222222222222222222222222",
    "respondent": "0x3333333333333333333333333333333333333333",
    "evidence_bundle_hash": "bafy...",
    "stake_gen": "0"
  }'`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
      <div className="min-w-0 space-y-6">
        <Card className="min-w-0 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-[#fff1eb] p-3 text-primary">
                <KeyRound className="size-6" />
              </div>
              <h2 className="text-2xl font-extrabold">Active API Keys</h2>
            </div>
            <Button disabled={isCreatingKey || selectedScopes.length === 0} onClick={() => void createApiKey()}>
              {isCreatingKey ? <Loader2 className="size-5 animate-spin" /> : <KeyRound className="size-5" />}
              Create API Key
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <Input value={keyLabel} onChange={(event) => setKeyLabel(event.target.value)} placeholder="Key name" />
            <div className="grid gap-2 sm:grid-cols-2">
              {availableScopes.map((scope) => (
                <label key={scope} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  <Checkbox checked={selectedScopes.includes(scope)} onCheckedChange={(checked) => toggleScope(scope, checked === true)} />
                  {scope}
                </label>
              ))}
            </div>
          </div>

          {plaintextKey ? (
            <div className="mt-5 rounded-xl border border-[#d7f0a2] bg-[#f4ffd6] p-4">
              <p className="text-sm font-bold text-[#176d44]">Copy this key now. It will only be shown once.</p>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#bfdc89] bg-card px-3 py-2">
                <code className="min-w-0 flex-1 truncate text-sm">{plaintextKey}</code>
                <Button onClick={() => void copy(plaintextKey)} size="sm" variant="ghost">
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[24%]" />
                <col className="w-[27%]" />
                <col className="w-[16%]" />
                <col className="w-[8%]" />
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
                {apiKeys.length ? (
                  apiKeys.map((key) => (
                    <tr key={key.id} className="border-b border-border last:border-b-0">
                      <td className="py-4 font-semibold">{key.label}</td>
                      <td className="py-4 font-mono">{key.prefix}...</td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          {key.scopes.map((scope) => (
                            <Badge key={scope}>{scope}</Badge>
                          ))}
                          {key.revokedAt ? <Badge variant="danger">revoked</Badge> : null}
                        </div>
                      </td>
                      <td className="py-4">{formatDate(key.createdAt)}</td>
                      <td className="py-4">
                        <Button disabled={Boolean(key.revokedAt)} onClick={() => void revokeApiKey(key.id)} size="sm" variant="ghost">
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <p className="font-bold text-primary">{isLoading ? "Loading API keys..." : "No API keys yet"}</p>
                      <p className="mt-2 text-muted-foreground">Create a key to use the B2B API.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-[#25130d] p-4 text-[#fff3ea]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Code2 className="size-5 text-[#f3c7aa]" />
                <div>
                  <p className="font-extrabold">Copy a working API request</p>
                  <p className="text-sm text-[#ead1c2]">Use this after creating a key with write:disputes.</p>
                </div>
              </div>
              <Button onClick={() => void copy(curlSnippet)} size="sm" variant="secondary">
                <Copy className="size-4" />
                Copy curl
              </Button>
            </div>
            <pre className="mt-4 overflow-x-auto text-xs leading-6">
              <code>{curlSnippet}</code>
            </pre>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase text-muted-foreground">Requests / Month</p>
              <TrendingUp className="size-5 text-[#d1b88e]" />
            </div>
            <p className="mt-6 text-4xl font-extrabold">0</p>
            <p className="mt-3 font-semibold text-muted-foreground">Tracked after API calls are recorded</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase text-muted-foreground">Webhook Endpoints</p>
              <AlertCircle className="size-5 text-[#e7cfc7]" />
            </div>
            <p className="mt-6 text-4xl font-extrabold">{webhooks.length}</p>
            <p className="mt-3 flex items-center gap-2 font-semibold text-muted-foreground">
              <Activity className="size-4" />
              {webhooks.length ? "Active delivery endpoints" : "No delivery endpoints yet"}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Recent Delivery Logs</h2>
            <Badge variant={deliveries.length ? "success" : "muted"}>{deliveries.length} shown</Badge>
          </div>
          <div className="mt-5 overflow-x-auto">
            {deliveries.length ? (
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-border text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3">Event</th>
                    <th className="py-3">Endpoint</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Attempts</th>
                    <th className="py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="border-b border-border last:border-b-0">
                      <td className="py-3 font-mono">{delivery.event}</td>
                      <td className="max-w-[240px] truncate py-3">{delivery.webhookUrl}</td>
                      <td className="py-3">
                        <Badge variant={delivery.status === "delivered" ? "success" : delivery.status === "failed" ? "danger" : "muted"}>
                          {delivery.status}
                        </Badge>
                      </td>
                      <td className="py-3">{delivery.attempts}</td>
                      <td className="py-3">{formatDate(delivery.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center">
                <p className="font-bold text-primary">No webhook deliveries yet</p>
                <p className="mt-2 text-sm text-muted-foreground">Save an endpoint and send a test to create the first log.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="min-w-0 p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-[#fff1eb] p-3 text-primary">
            <Webhook className="size-6" />
          </div>
          <h2 className="text-2xl font-extrabold">Webhooks</h2>
        </div>
        <p className="mt-6 leading-7 text-muted-foreground">
          Receive signed HTTP POST notifications when verdicts are delivered.
        </p>
        <label className="mt-6 block">
          <span className="font-semibold">Endpoint URL</span>
          <Input
            className="mt-3"
            placeholder="https://api.yoursite.com/webhooks/disputr"
            value={endpointUrl}
            onChange={(event) => setEndpointUrl(event.target.value)}
          />
        </label>
        <div className="mt-6 space-y-3">
          <p className="font-semibold">Events to send</p>
          <label className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-4">
            <Checkbox checked disabled />
            <span>verdict.delivered</span>
          </label>
        </div>
        {signingSecret ? (
          <div className="mt-6 rounded-xl border border-[#d7f0a2] bg-[#f4ffd6] p-4">
            <p className="text-sm font-bold text-[#176d44]">Copy this signing secret now.</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#bfdc89] bg-card px-3 py-2">
              <code className="min-w-0 flex-1 truncate text-sm">{signingSecret}</code>
              <Button onClick={() => void copy(signingSecret)} size="sm" variant="ghost">
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
        <div className="mt-6 border-t border-border pt-6">
          <Button className="w-full" disabled={isSavingWebhook || !endpointUrl} onClick={() => void saveWebhook()} variant="outline">
            {isSavingWebhook ? <Loader2 className="size-5 animate-spin" /> : null}
            Save Webhook
          </Button>
        </div>
        <div className="mt-6 space-y-3">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="rounded-xl border border-border bg-card p-4">
              <p className="truncate font-semibold">{webhook.url}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{webhook.secretHint}</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant={webhook.active ? "success" : "muted"}>{webhook.active ? "active" : "inactive"}</Badge>
                <div className="flex items-center gap-2">
                  <Button disabled={testingWebhookId === webhook.id} onClick={() => void testWebhook(webhook.id)} size="sm" variant="outline">
                    {testingWebhookId === webhook.id ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    Test
                  </Button>
                  <Button onClick={() => void deleteWebhook(webhook.id)} size="sm" variant="ghost">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {status ? <p className="mt-5 text-sm font-semibold text-[#176d44]">{status}</p> : null}
        {error ? <p className="mt-5 text-sm font-semibold text-red-700">{error}</p> : null}
      </Card>
    </div>
  );
}
