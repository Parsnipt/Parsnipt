import UploadForm from '../components/features/UploadForm';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-4xl mx-auto pt-12 pb-16 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-brand-darkGreen/90 mb-4">
          Welcome to Parsnipt, {user?.name?.split(' ')[0] || 'Developer'}
        </h1>
        <p className="text-lg text-brand-brown font-medium">
          Drag and drop a React, JavaScript, or TypeScript file below to instantly extract its architecture.
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-brand-darkBrown/10 border-2 border-brand-brown/60">        
        <UploadForm />
      </div>
    </div>
  );
}