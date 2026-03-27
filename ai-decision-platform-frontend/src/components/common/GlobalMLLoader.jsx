import { useML } from "../../context/MLContext";

const GlobalMLLoader = () => {
  const { mlLoading } = useML();

  if (!mlLoading) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 px-4 py-3 rounded-lg shadow-lg z-50">
      <p className="text-sm text-yellow-700">
        🚀 AI model is waking up... please wait
      </p>
    </div>
  );
};

export default GlobalMLLoader;