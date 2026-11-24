"use client";

import { useState } from "react";
import { ConfirmModal } from "./confirm-modal";

interface DeleteUserButtonProps {
  userId: string;
  username: string;
  onSuccess?: () => void;
}

export function DeleteUserButton({
  userId,
  username,
  onSuccess,
}: DeleteUserButtonProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteModalOpen(false);
    setDeleting(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onSuccess?.();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={deleting}
        style={{
          padding: "0.375rem 0.75rem",
          background: "#fee2e2",
          color: "#991b1b",
          border: "none",
          borderRadius: "0.375rem",
          fontSize: "0.75rem",
          fontWeight: "500",
          cursor: deleting ? "not-allowed" : "pointer",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          if (!deleting) e.currentTarget.style.background = "#fecaca";
        }}
        onMouseLeave={(e) => {
          if (!deleting) e.currentTarget.style.background = "#fee2e2";
        }}
      >
        {deleting ? "..." : "Delete"}
      </button>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${username}"? This will also delete all interviews created by this user. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
