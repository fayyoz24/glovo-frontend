import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { catalogApi } from "../api/catalog";
import ProductRow from "../components/ProductRow";
import EmptyState from "../components/EmptyState";
import ProductModal from "../components/ProductModal";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      catalogApi
        .search(query.trim())
        .then((data) => {
          setResults(data.results || []);
          setSearched(true);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-4 py-3">
        <Search size={18} className="text-ink/40" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Taom, mahsulot yoki do'kon nomi"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink/40"
        />
        {loading && <Loader2 size={16} className="animate-spin text-ink/40" />}
      </div>

      {!searched && query.trim().length < 2 && (
        <EmptyState
          icon={Search}
          title="Qidirishni boshlang"
          description="Kamida 2 ta harf kiriting — masalan, 'lag'mon' yoki 'pitsa'."
        />
      )}

      {searched && results.length === 0 && !loading && (
        <EmptyState title="Hech narsa topilmadi" description={`"${query}" bo'yicha natija yo'q.`} />
      )}

      <div className="space-y-2.5">
        {results.map((p) => (
          <ProductRow key={p.id} product={p} onOpen={() => setActiveProductId(p.id)} />
        ))}
      </div>

      {activeProductId && (
        <ProductModal productId={activeProductId} onClose={() => setActiveProductId(null)} />
      )}
    </div>
  );
}
