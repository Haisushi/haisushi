import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Podcast, CalendarDays } from "lucide-react";

interface DashboardStats {
  totalEpisodes: number;
  latestEpisode: string | null;
  categories: string[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEpisodes: 0,
    latestEpisode: null,
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Get total episodes
        const { count: totalEpisodes, error: countError } = await supabase
          .from("episodes")
          .select("*", { count: "exact", head: true });

        if (countError) throw countError;

        // Get latest episode
        const { data: latestData, error: latestError } = await supabase
          .from("episodes")
          .select("titulo, publicado_em")
          .order("publicado_em", { ascending: false })
          .limit(1)
          .single();

        if (latestError && latestError.code !== "PGRST116") throw latestError;

        // Get unique categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("episodes")
          .select("categoria_id");

        if (categoriesError) throw categoriesError;

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(categoriesData?.map((item) => item.categoria_id) || [])
        );

        setStats({
          totalEpisodes: totalEpisodes || 0,
          latestEpisode: latestData?.titulo || null,
          categories: uniqueCategories,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando estatísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Episódios</CardTitle>
            <Podcast className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEpisodes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Último Episódio</CardTitle>
            <CalendarDays className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {stats.latestEpisode || "Nenhum episódio publicado"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <span className="text-base font-bold">{stats.categories.length}</span>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.categories.length > 0 ? (
                stats.categories.map((category) => (
                  <span
                    key={category}
                    className="bg-gray-100 text-xs px-2 py-1 rounded-full"
                  >
                    {category}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">Nenhuma categoria encontrada</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
