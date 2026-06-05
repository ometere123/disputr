import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { contractStatus } from "@/config/genlayer";

export function ContractStatus({ compact = false }: { compact?: boolean }) {
  const configured = contractStatus.disputr && contractStatus.credentialNft && contractStatus.appealOracle;

  if (configured) {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="size-3" />
        Contracts configured
      </Badge>
    );
  }

  return (
    <Badge variant="warning" className="gap-1">
      <AlertCircle className="size-3" />
      {compact ? "Contract not configured" : "Contract not configured"}
    </Badge>
  );
}
