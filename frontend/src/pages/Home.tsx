import UploadForm from '../components/features/UploadForm';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-16 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-brand-darkGreen mb-4">
          Welcome to Parsnipt, {user?.name?.split(' ')[0] || 'Developer'}
        </h1>
        <p className="text-lg text-brand-brown">
          Drag and drop a React, JavaScript, or TypeScript file below to instantly extract its architecture.
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-brand-brown/50">        
        <UploadForm />
      </div>
    </div>
  );
}