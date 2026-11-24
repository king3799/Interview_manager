"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "./confirm-modal";

interface DeleteInterviewButtonProps {
  interviewId: string;
  onSuccess?: () => void;
  variant?: "button" | "icon";
  redirectAfterDelete?: boolean;
}

export function DeleteInterviewButton({
  interviewId,
  onSuccess,
  variant = "button",
  redirectAfterDelete = false,
}: DeleteInterviewButtonProps) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteModalOpen(false);
    setDeleting(true);

    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (redirectAfterDelete) {
          router.push("/interviews");
          router.refresh();
        } else {
          onSuccess?.();
        }
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete interview");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Failed to delete interview");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  if (variant === "icon") {
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
          title="Delete Interview"
          message="Are you sure you want to delete this interview? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={deleting}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          background: deleting ? "#fecaca" : "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: "600",
          cursor: deleting ? "not-allowed" : "pointer",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          if (!deleting) e.currentTarget.style.background = "#b91c1c";
        }}
        onMouseLeave={(e) => {
          if (!deleting) e.currentTarget.style.background = "#dc2626";
        }}
      >
        <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {deleting ? "Deleting..." : "Delete"}
      </button>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Interview"
        message="Are you sure you want to delete this interview? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
