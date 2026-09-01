"use client";

import { deleteClientAction } from "@/actions/workspace";
import { Button } from "@/components/ui/button";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  return (
    <form
      action={deleteClientAction.bind(null, clientId)}
      onSubmit={(event) => {
        if (!confirm("Delete this client and unlink their audits?")) event.preventDefault();
      }}
    >
      <Button type="submit" variant="outline">
        Delete
      </Button>
    </form>
  );
}
