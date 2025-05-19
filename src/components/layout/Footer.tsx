
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 px-6 bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              © {currentYear} PodcastApp. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-podcast text-sm">
              Sobre
            </a>
            <a href="#" className="text-gray-500 hover:text-podcast text-sm">
              Contato
            </a>
            <a href="#" className="text-gray-500 hover:text-podcast text-sm">
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
