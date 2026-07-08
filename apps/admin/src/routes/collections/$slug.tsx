import { useEffect, useState } from "react";
import { createRoute, Link, useParams } from "@tanstack/react-router";
import { Route as rootRoute } from "@/routes/__root";
import { fetchCollections, apiFetch, type CollectionMeta } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collections/$slug",
  component: CollectionEntries,
});

type Entry = Record<string, unknown> & { id: string };

function CollectionEntries() {
  const { slug } = useParams({ from: Route.id });
  const [collection, setCollection] = useState<CollectionMeta | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const cols = await fetchCollections();
        const col = cols.find((c) => c.slug === slug);
        if (!col) throw new Error(`Collection "${slug}" not found`);
        if (cancelled) return;
        setCollection(col);

        const data = await apiFetch<{ data: Entry[]; total: number }>(`/api/${slug}`);
        if (cancelled) return;
        setEntries(data.data);
        setTotal(data.total);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load entries");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/${slug}/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry");
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading entries...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/collections"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to collections
        </Link>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>
      </div>
    );
  }

  if (!collection) return null;

  const displayFields = collection.fields.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/collections" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{collection.label}</h1>
            <p className="text-muted-foreground">
              {total} entr{total === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>
        <Link to="/collections/$slug/new" params={{ slug }}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New
          </Button>
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border p-12 text-center">
          <p className="text-lg text-muted-foreground">No entries yet</p>
          <Link to="/collections/$slug/new" params={{ slug }}>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Create your first entry
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {displayFields.map((f) => (
                  <th
                    key={f.name}
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                  >
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/50">
                  {displayFields.map((f) => (
                    <td key={f.name} className="px-4 py-3 text-sm">
                      {formatValue(entry[f.name])}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to="/collections/$slug/$id" params={{ slug, id: entry.id }}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}
