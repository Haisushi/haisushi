
import { Episode } from '@/components/episodes/EpisodeCard';

// Mock data for episodes
export const mockEpisodes: Episode[] = [
  {
    id: '1',
    titulo: 'O Futuro da Inteligência Artificial',
    descricao: 'Neste episódio, discutimos as tendências e avanços mais recentes em IA, entrevistando especialistas sobre como essa tecnologia transformará nossas vidas nos próximos anos.',
    audio: 'https://s3.amazonaws.com/scifri-episodes/scifri20181123-episode.mp3',
    capa: 'https://images.unsplash.com/photo-1677442135136-760302227ef4?q=80&w=800&auto=format&fit=crop',
    publicado_em: '2023-10-15',
    categoria: 'Tecnologia'
  },
  {
    id: '2',
    titulo: 'Meditação Guiada para Iniciantes',
    descricao: 'Um episódio especial com exercícios práticos para quem deseja começar a meditar e não sabe por onde começar.',
    audio: 'https://s3.amazonaws.com/scifri-segments/scifri201501304.mp3',
    capa: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
    publicado_em: '2023-09-28',
    categoria: 'Bem-estar'
  },
  {
    id: '3',
    titulo: 'Histórias de Empreendedorismo Brasileiro',
    descricao: 'Conversamos com fundadores de startups brasileiras que revolucionaram seus mercados, compartilhando desafios e aprendizados.',
    audio: 'https://s3.amazonaws.com/scifri-segments/scifri202011274.mp3',
    capa: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
    publicado_em: '2023-11-05',
    categoria: 'Negócios'
  },
  {
    id: '4',
    titulo: 'Astronomia: Os Segredos do Cosmos',
    descricao: 'Uma conversa fascinante com astrofísicos sobre as descobertas mais recentes sobre buracos negros, exoplanetas e a expansão do universo.',
    audio: 'https://s3.amazonaws.com/scifri-segments/scifri202110152.mp3',
    capa: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=800&auto=format&fit=crop',
    publicado_em: '2023-08-12',
    categoria: 'Ciência'
  },
  {
    id: '5',
    titulo: 'Filosofia Prática para Tempos Modernos',
    descricao: 'Como os ensinamentos dos grandes filósofos podem nos ajudar a navegar pelos dilemas éticos e existenciais do século XXI.',
    audio: 'https://s3.amazonaws.com/scifri-segments/scifri202007102.mp3',
    capa: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    publicado_em: '2023-07-22',
    categoria: 'Filosofia'
  },
  {
    id: '6',
    titulo: 'Gastronomia Brasileira: Além da Feijoada',
    descricao: 'Exploramos a riqueza gastronômica das diversas regiões do Brasil, com chefs e pesquisadores da cultura alimentar.',
    audio: 'https://s3.amazonaws.com/scifri-segments/scifri202002071.mp3',
    capa: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
    publicado_em: '2023-10-02',
    categoria: 'Cultura'
  }
];

// Utility functions for CRUD operations
let episodes = [...mockEpisodes];

export const getEpisodes = () => {
  return [...episodes];
};

export const getEpisodeById = (id: string) => {
  return episodes.find(episode => episode.id === id);
};

export const addEpisode = (episode: Omit<Episode, "id">) => {
  const newEpisode = {
    ...episode,
    id: Date.now().toString()
  };
  episodes = [...episodes, newEpisode];
  return newEpisode;
};

export const updateEpisode = (id: string, updatedEpisode: Partial<Episode>) => {
  episodes = episodes.map(episode => 
    episode.id === id ? { ...episode, ...updatedEpisode } : episode
  );
  return episodes.find(episode => episode.id === id);
};

export const deleteEpisode = (id: string) => {
  const episodeToDelete = episodes.find(episode => episode.id === id);
  episodes = episodes.filter(episode => episode.id !== id);
  return episodeToDelete;
};

export const searchEpisodes = (query: string, category?: string) => {
  return episodes.filter(episode => {
    const matchesQuery = episode.titulo.toLowerCase().includes(query.toLowerCase()) ||
                         episode.descricao.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || episode.categoria === category;
    
    return matchesQuery && matchesCategory;
  });
};

export const getCategories = () => {
  const categories = new Set(episodes.map(episode => episode.categoria));
  return Array.from(categories);
};
