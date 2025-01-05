// src/pages/roadmap.tsx
import { Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigationStore } from '../store/navigationStore';
import StellarRoadmap from '../components/stellar-roadmap/index';
import { initialNodes, initialEdges } from '../data/roadmapData';

const RoadmapRoute = () => {
  const { setCurrentScene } = useNavigationStore();
  
  useEffect(() => {
    setCurrentScene('roadmap');
  }, [setCurrentScene]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-full mx-auto p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-[calc(100vh-2rem)]"
        >
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-blue-400 animate-pulse">Loading roadmap...</div>
            </div>
          }>
            <StellarRoadmap nodes={initialNodes} edges={initialEdges} />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
};

export default RoadmapRoute;