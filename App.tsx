
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import { ProcessingType, MediaFile, ProcessingState } from './types';
import { removeWatermarkImage, removeWatermarkVideo } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProcessingType>(ProcessingType.IMAGE);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [resultMedia, setResultMedia] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    status: '',
  });

  const handleFileSelect = (file: File, type: ProcessingType) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedMedia({
        file,
        preview: reader.result as string,
        type,
      });
      setResultMedia(null);
    };
    reader.readAsDataURL(file);
  };

  const processMedia = async () => {
    if (!selectedMedia) return;

    setProcessing({ isProcessing: true, status: 'Analyzing media...' });
    
    try {
      if (selectedMedia.type === ProcessingType.IMAGE) {
        const base64Data = selectedMedia.preview.split(',')[1];
        const result = await removeWatermarkImage(base64Data, selectedMedia.file.type);
        setResultMedia(result);
      } else {
        const result = await removeWatermarkVideo(selectedMedia.file, (msg) => {
          setProcessing(prev => ({ ...prev, status: msg }));
        });
        setResultMedia(result);
      }
    } catch (err) {
      console.error(err);
      alert("Processing failed. Please try again with a smaller file or better connection.");
    } finally {
      setProcessing({ isProcessing: false, status: '' });
    }
  };

  const reset = () => {
    setSelectedMedia(null);
    setResultMedia(null);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto px-4 pt-12 w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Magical Watermark <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Removal with AI</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Professional-grade object removal and photo restoration. Powered by the world's most advanced Gemini 2.5 Flash and Veo models.
          </p>
        </div>

        {/* Tab Switcher */}
        {!selectedMedia && (
          <div className="flex justify-center mb-10">
            <div className="bg-slate-800 p-1.5 rounded-2xl flex space-x-1 shadow-inner border border-slate-700">
              <button
                onClick={() => setActiveTab(ProcessingType.IMAGE)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  activeTab === ProcessingType.IMAGE 
                  ? 'bg-slate-700 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className="fas fa-image"></i>
                <span>Photo</span>
              </button>
              <button
                onClick={() => setActiveTab(ProcessingType.VIDEO)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  activeTab === ProcessingType.VIDEO 
                  ? 'bg-slate-700 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className="fas fa-video"></i>
                <span>Video</span>
              </button>
            </div>
          </div>
        )}

        {/* Tool Section */}
        <div className="max-w-3xl mx-auto">
          {!selectedMedia ? (
            <FileUpload onFileSelect={handleFileSelect} acceptedType={activeTab} />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Preview */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Original</h3>
                  <div className="aspect-video bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
                    {selectedMedia.type === ProcessingType.IMAGE ? (
                      <img src={selectedMedia.preview} className="w-full h-full object-contain" alt="Original" />
                    ) : (
                      <video src={selectedMedia.preview} className="w-full h-full object-contain" controls />
                    )}
                  </div>
                </div>

                {/* Result Preview */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Cleaned Result</h3>
                  <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative flex items-center justify-center">
                    {processing.isProcessing ? (
                      <div className="flex flex-col items-center space-y-4 p-8 text-center">
                        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                        <div>
                          <p className="font-bold text-white">{processing.status}</p>
                          <p className="text-xs text-slate-500 mt-1 italic">This may take a minute...</p>
                        </div>
                      </div>
                    ) : resultMedia ? (
                      selectedMedia.type === ProcessingType.IMAGE ? (
                        <img src={resultMedia} className="w-full h-full object-contain animate-in fade-in duration-700" alt="Result" />
                      ) : (
                        <video src={resultMedia} className="w-full h-full object-contain animate-in fade-in duration-700" controls />
                      )
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center">
                        <i className="fas fa-wand-sparkles text-4xl mb-3 opacity-20"></i>
                        <p className="text-sm font-medium">Ready for processing</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-slate-800/50 rounded-3xl border border-slate-700">
                <button
                  onClick={reset}
                  disabled={processing.isProcessing}
                  className="w-full md:w-auto px-8 py-3 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  <i className="fas fa-rotate-left mr-2"></i> Choose Another
                </button>
                
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                   {!resultMedia ? (
                    <button
                      onClick={processMedia}
                      disabled={processing.isProcessing}
                      className="w-full md:w-auto px-12 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-white shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                      {processing.isProcessing ? (
                        <>
                          <i className="fas fa-circle-notch animate-spin mr-2"></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-magic mr-2"></i>
                          Remove Watermark
                        </>
                      )}
                    </button>
                   ) : (
                    <a
                      href={resultMedia}
                      download={`cleaned-${selectedMedia.file.name}`}
                      className="w-full md:w-auto px-12 py-3 bg-green-500 rounded-2xl font-bold text-white shadow-xl shadow-green-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                    >
                      <i className="fas fa-download mr-2"></i>
                      Download HD
                    </a>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: 'fa-brain',
              title: 'Neural Inpainting',
              desc: 'Our AI doesn\'t just blur. It regenerates missing details by understanding the context of your image.'
            },
            {
              icon: 'fa-gauge-high',
              title: 'Blazing Fast',
              desc: 'Optimized Gemini 2.5 Flash infrastructure ensures sub-5 second processing for images.'
            },
            {
              icon: 'fa-film',
              title: 'Video Support',
              desc: 'Advanced temporal consistency logic keeps video edges sharp and flicker-free.'
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-slate-800/30 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all group">
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 group-hover:text-cyan-500 transition-colors">
                <i className={`fas ${feature.icon} text-2xl`}></i>
              </div>
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 CleanLens AI. Powered by Google Gemini. All processing is private and secure.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
