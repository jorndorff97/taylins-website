"use client";

import { Button } from "@/components/ui/button";
import { deleteListing } from "@/app/admin/(dashboard)/listings/actions";

interface DeleteListingButtonProps {
  listingId: number;
}

export function DeleteListingButton({ listingId }: DeleteListingButtonProps) {
  const handleSubmit = (e: React.FormEvent) => {
    if (!confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) {
      e.preventDefault();
    }
  };

  return (
    <form action={deleteListing} className="ml-auto" onSubmit={handleSubmit}>
      <input type="hidden" name="listingId" value={listingId} />
      <Button 
        type="submit" 
        variant="ghost" 
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        Delete listing
      </Button>
    </form>
  );
}
