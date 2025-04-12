import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlateCustomizer from "@/components/plates/PlateCustomizer";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <PlateCustomizer />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
