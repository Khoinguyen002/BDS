"use client";

import React, { useEffect, useState, useMemo } from "react";
import { BlocksField, useAuth } from "@payloadcms/ui";

// Define strict types for blocks since payload-types might not export them
type BlockConfig = {
  slug: string;
  admin?: {
    custom?: {
      tags?: Record<string, string[]>;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type CustomBlocksFieldProps = {
  field: {
    blocks: BlockConfig[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type BlockPermission = {
  allowedPlans?: unknown[] | null;
  includeUsers?: unknown[] | null;
  excludeUsers?: unknown[] | null;
};

export const CustomBlocksField: React.FC<CustomBlocksFieldProps> = (props) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, BlockPermission> | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Fetch ComponentPermissions
    fetch("/api/globals/component-permissions")
      .then((res) => res.json())
      .then((data: Record<string, BlockPermission>) => {
        setPermissions(data);
      })
      .catch((err) =>
        console.error("Error fetching component permissions:", err)
      );
  }, []);

  // Extract blocks to avoid dot notation in dependency array
  const blocks = props.field?.blocks;

  // Filter blocks
  const filteredBlocks = useMemo(() => {
    if (!blocks) return [];

    return blocks.filter((block) => {
      // 1. Search filtering
      if (searchQuery) {
        // extract label
        const customObj = block.admin?.custom as Record<string, unknown> | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const labels = block.labels as any;
        const blockLabel = typeof customObj?.label === 'string' 
           ? customObj.label 
           : (typeof labels?.singular === "object" ? labels.singular.vi || block.slug : labels?.singular || block.slug);
        const searchMatch = String(blockLabel).toLowerCase().includes(searchQuery.toLowerCase()) || block.slug.toLowerCase().includes(searchQuery.toLowerCase());
        if (!searchMatch) return false;
      }

      // Admin bypasses permissions
      if (user?.role === "admin") return true;

      // 2. Permission filtering
      if (permissions && permissions[block.slug]) {
        const blockPerm = permissions[block.slug];

        const getID = (obj: unknown) => (typeof obj === "object" && obj !== null && "id" in obj ? (obj as {id: string | number}).id : obj);

        // Check excludeUsers
        const isExcluded = blockPerm.excludeUsers?.some(
          (u) => getID(u) === user?.id
        );
        if (isExcluded) return false;

        // Check includeUsers
        const isIncluded = blockPerm.includeUsers?.some(
          (u) => getID(u) === user?.id
        );
        if (isIncluded) return true;

        // Check allowedPlans
        if (blockPerm.allowedPlans && blockPerm.allowedPlans.length > 0) {
          const userPlanId =
            typeof user?.activeSubscription === "object" && user.activeSubscription !== null
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? getID((user.activeSubscription as any).plan) // Using any here because Payload User type might not be fully known here
              : null;

          if (!userPlanId) return false;

          const isPlanAllowed = blockPerm.allowedPlans.some(
            (p) => getID(p) === userPlanId
          );
          if (!isPlanAllowed) return false;
        }
      }

      return true;
    });
  }, [blocks, searchQuery, permissions, user]);



  return (
    <div className="custom-blocks-field" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          padding: "1rem",
          backgroundColor: "var(--theme-bg)",
          border: "1px solid var(--theme-elevation-100)",
          borderRadius: "4px",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "var(--theme-text)",
            }}
          >
            Tìm kiếm Component:
          </label>
          <input
            type="text"
            placeholder="Nhập tên block..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--theme-elevation-200)",
              borderRadius: "4px",
              backgroundColor: "var(--theme-input-bg)",
              color: "var(--theme-text)",
              outline: "none",
            }}
          />
        </div>

        {searchQuery && (
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
              }}
              style={{
                padding: "0.35rem 0.5rem",
                borderRadius: "9999px",
                border: "none",
                background: "transparent",
                color: "var(--theme-error-500, #ef4444)",
                cursor: "pointer",
                fontSize: "0.875rem",
                textDecoration: "underline",
              }}
            >
              Xóa tìm kiếm
            </button>
          </div>
        )}
      </div>

      {/* eslint-disable @typescript-eslint/no-explicit-any */}
      <BlocksField
        {...(props as any)}
        field={{
          ...(props.field as any),
          blocks: filteredBlocks as any,
        }}
      />
      {/* eslint-enable @typescript-eslint/no-explicit-any */}
    </div>
  );
};
