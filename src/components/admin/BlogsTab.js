"use client";

import { useState, useMemo } from "react";
import { FileText, CheckCircle, Clock, Plus, Eye, Edit3, Trash2 } from "lucide-react";
import StatCard from "./StatCard";
import FilterTabs from "./FilterTabs";
import SearchInput from "./SearchInput";
import StatusChip from "./StatusChip";
import Button from "./Button";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";
import ConfirmDialog from "./ConfirmDialog";

export default function BlogsTab({
  blogs = [],
  totalBlogs = 0,
  searchTerm = "",
  onSearchChange,
  onClearSearch,
  statusFilter = "all", // all, Published, Drafts
  onStatusFilterChange,
  sortOrder = "newest",
  onSortOrderChange,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onPerPageChange,
  onOpenCreateBlog,
  onEditBlog,
  onDeleteBlog,
  loading = false
}) {
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // Compute counts
  const publishedCount = useMemo(() => {
    return blogs.filter(b => b.status === "Published" || !b.status).length;
  }, [blogs]);

  const draftsCount = useMemo(() => {
    return blogs.filter(b => b.status === "Draft").length;
  }, [blogs]);

  const filterTabs = [
    { id: "all", label: "All", count: totalBlogs },
    { id: "Published", label: "Published", count: publishedCount }
  ];
  if (draftsCount > 0 || true) {
    filterTabs.push({ id: "Drafts", label: "Drafts", count: draftsCount });
  }

  // Detect duplicate titles
  const duplicateTitles = useMemo(() => {
    const counts = {};
    blogs.forEach(b => {
      const t = (b.title || "").trim().toLowerCase();
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
    return Object.keys(counts).filter(t => counts[t] > 1);
  }, [blogs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            Manage Blog Articles
          </h1>
          <p style={{ fontSize: "14px", color: "#4a5878", margin: 0, fontWeight: "500" }}>
            Create, publish, edit, and delete informational blog posts.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => window.open("/blogs", "_blank")}
          >
            View Portal
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onOpenCreateBlog}
            icon={Plus}
          >
            + Create New Blog
          </Button>
        </div>
      </div>

      {/* 2. Top 3 Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
        <StatCard
          icon={FileText}
          value={totalBlogs}
          label="Total Blog Posts"
          color="purple"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          value={publishedCount}
          label="Published"
          color="green"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          value={draftsCount}
          label="Drafts"
          color="orange"
          loading={loading}
        />
      </div>

      {/* 3. Blog Posts Directory Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #d9e2fa",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
          overflow: "hidden"
        }}
      >
        {/* Title & Toolbar */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2fb", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
            Blog Posts Directory
          </h3>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
            <FilterTabs
              tabs={filterTabs}
              activeTab={statusFilter}
              onChange={onStatusFilterChange}
              loading={loading}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <select
                value={sortOrder || "newest"}
                onChange={(e) => onSortOrderChange && onSortOrderChange(e.target.value)}
                aria-label="Sort order"
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid #d9e2fa",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  color: "#0f1a3d",
                  fontWeight: "600",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          <SearchInput
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            onClear={onClearSearch}
            placeholder="Search blogs by title..."
            style={{ maxWidth: "460px" }}
          />
        </div>

        {/* Table Content */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          {(loading && blogs.length === 0) ? (
            <SkeletonLoader type="table" rows={4} cols={5} />
          ) : blogs.length === 0 ? (
            <EmptyState
              title="No blog articles found"
              description="Start by creating an engaging blog post to share news and insights."
              actionLabel="+ Create First Blog"
              onAction={onOpenCreateBlog}
            />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8faff", borderBottom: "1px solid #eef2fb", color: "#4a5878", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "12px 18px", width: "100px" }}>Cover</th>
                  <th style={{ padding: "12px 18px" }}>Title & Snippet</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px" }}>Published</th>
                  <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => {
                  const id = blog.id || blog._id;
                  const isDuplicate = duplicateTitles.includes((blog.title || "").trim().toLowerCase());
                  const dateStr = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "29 Jul 2026";
                  const snippet = blog.content ? blog.content.replace(/<[^>]*>/g, "").substring(0, 95) + "..." : "No description preview available.";

                  return (
                    <tr key={id} className="admin-table-row" style={{ borderBottom: "1px solid #f1f5ff" }}>
                      {/* Cover Thumbnail */}
                      <td style={{ padding: "14px 18px" }}>
                        <div
                          style={{
                            width: "80px",
                            height: "52px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            backgroundColor: "#1e293b",
                            border: "1px solid #d9e2fa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {blog.image ? (
                            <img
                              src={blog.image}
                              alt={blog.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(135deg, #78350f 0%, #1c1917 100%)"
                              }}
                            />
                          )}
                        </div>
                      </td>

                      {/* Title & Snippet */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f1a3d" }}>
                              {blog.title}
                            </span>
                            {isDuplicate && (
                              <StatusChip variant="flag" style={{ fontSize: "10.5px", padding: "1px 7px" }}>
                                Same title as another post
                              </StatusChip>
                            )}
                          </div>
                          <span style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>
                            {snippet}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px" }}>
                        <StatusChip status={blog.status || "Published"} />
                      </td>

                      {/* Published Date */}
                      <td style={{ padding: "14px 16px", color: "#4a5878", whiteSpace: "nowrap" }}>
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Button
                            variant="soft-gray"
                            size="sm"
                            onClick={() => window.open(`/blogs/${id}`, "_blank")}
                          >
                            View
                          </Button>
                          <Button
                            variant="soft-blue"
                            size="sm"
                            onClick={() => onEditBlog && onEditBlog(blog)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="soft-red"
                            size="sm"
                            onClick={() => setDeleteConfirmTarget(blog)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalBlogs > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalBlogs}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        )}
      </div>

      {/* 4. "Before you publish" Tip Callout Box matching Screenshot 4 */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #d9e2fa",
          borderRadius: "16px",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          boxShadow: "0 2px 6px rgba(15, 26, 61, 0.02)"
        }}
      >
        <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
          Before you publish
        </h4>
        <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
          Add a clear cover image, write a unique title, and keep the snippet to one or two lines so it reads well on the portal.
        </p>
      </div>

      {/* Confirm Dialog for Blog Delete */}
      <ConfirmDialog
        isOpen={!!deleteConfirmTarget}
        title="Delete Blog Article?"
        message={`Are you sure you want to permanently delete "${deleteConfirmTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Blog"
        onConfirm={() => {
          if (deleteConfirmTarget && onDeleteBlog) {
            onDeleteBlog(deleteConfirmTarget.id || deleteConfirmTarget._id);
          }
          setDeleteConfirmTarget(null);
        }}
        onClose={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
}

