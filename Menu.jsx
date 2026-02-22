import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Phone, MapPin, Clock, Heart, Flame } from 'lucide-react';

export default function Menu({ menuImages = [], restaurantInfo = {} }) {
    const [currentPage, setCurrentPage] = useState(0);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [showWelcome, setShowWelcome] = useState(true);
    const [animationPhase, setAnimationPhase] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const images = menuImages.length > 0 ? menuImages : [
        '/images/menu-1.jpeg',
        '/images/menu-2.jpeg'
    ];

    // Precargar imagenes de forma simple (compatible con iOS Safari)
    useEffect(() => {
        let loadedCount = 0;
        images.forEach(src => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    setImagesLoaded(true);
                }
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    setImagesLoaded(true);
                }
            };
            img.src = src;
        });
        // Timeout de seguridad - mostrar despues de 3 segundos aunque no carguen
        const timeout = setTimeout(() => setImagesLoaded(true), 3000);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        // Animation sequence - 4 seconds total (mas rapido)
        const timers = [
            setTimeout(() => setAnimationPhase(1), 500),
            setTimeout(() => setAnimationPhase(2), 1200),
            setTimeout(() => setAnimationPhase(3), 2200),
            setTimeout(() => setShowWelcome(false), 4000),
        ];
        return () => timers.forEach(t => clearTimeout(t));
    }, []);

    const goToPage = (direction) => {
        const nextPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
        if (nextPage >= 0 && nextPage < images.length) {
            setCurrentPage(nextPage);
        }
    };

    // Touch handling
    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
    const handleTouchEnd = (e) => {
        if (!touchStart) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentPage < images.length - 1) goToPage('next');
            else if (diff < 0 && currentPage > 0) goToPage('prev');
        }
        setTouchStart(null);
    };

    // Welcome Splash Screen - VERSION COMPATIBLE
    if (showWelcome) {
        return (
            <>
                <Head title="Menu - Mi Fogon" />
                <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 flex items-center justify-center overflow-hidden">
                    <style>{`
                        @keyframes fadeInUp {
                            from { 
                                opacity: 0;
                                transform: translateY(30px);
                            }
                            to { 
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        @keyframes pulse-glow {
                            0%, 100% { 
                                box-shadow: 0 0 20px rgba(251,146,60,0.5);
                            }
                            50% { 
                                box-shadow: 0 0 40px rgba(251,146,60,0.8), 0 0 60px rgba(251,146,60,0.4);
                            }
                        }
                        @keyframes flame-dance {
                            0%, 100% { transform: scale(1) rotate(-2deg); }
                            50% { transform: scale(1.05) rotate(2deg); }
                        }
                        @keyframes shimmer {
                            0% { background-position: -200% center; }
                            100% { background-position: 200% center; }
                        }
                        @keyframes float-up {
                            0% { 
                                opacity: 0;
                                transform: translateY(20px);
                            }
                            100% { 
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        @keyframes dot-bounce {
                            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                            40% { transform: scale(1.2); opacity: 1; }
                        }
                        .shimmer-text {
                            background: linear-gradient(90deg, #fcd34d 0%, #fff 50%, #fcd34d 100%);
                            background-size: 200% auto;
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            animation: shimmer 3s linear infinite;
                        }
                    `}</style>

                    {/* Background overlay */}
                    <div className="absolute inset-0 bg-black/20" />

                    {/* Decorative circles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="absolute rounded-full border-2 border-orange-400/20"
                                style={{
                                    width: `${150 + i * 100}px`,
                                    height: `${150 + i * 100}px`,
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    animation: `pulse-glow ${2 + i * 0.5}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.3}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* Main content */}
                    <div className="text-center z-10 relative px-6">
                        {/* Fire icon using Lucide (SVG - compatible) */}
                        <div 
                            className="mb-6"
                            style={{
                                opacity: animationPhase >= 1 ? 1 : 0,
                                animation: animationPhase >= 1 ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                            }}
                        >
                            <div 
                                className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-orange-500 to-red-600"
                                style={{
                                    boxShadow: '0 0 40px rgba(251,146,60,0.6), 0 0 80px rgba(251,146,60,0.3)',
                                    animation: 'flame-dance 1s ease-in-out infinite'
                                }}
                            >
                                <Flame className="w-16 h-16 md:w-20 md:h-20 text-yellow-300" strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Restaurant name */}
                        <h1 
                            className="text-5xl md:text-7xl font-black mb-4"
                            style={{
                                opacity: animationPhase >= 2 ? 1 : 0,
                                animation: animationPhase >= 2 ? 'fadeInUp 0.6s ease-out forwards' : 'none',
                                fontFamily: 'system-ui, -apple-system, sans-serif'
                            }}
                        >
                            <span className="shimmer-text">Mi Fogon</span>
                        </h1>

                        {/* Tagline */}
                        <div 
                            style={{
                                opacity: animationPhase >= 3 ? 1 : 0,
                                animation: animationPhase >= 3 ? 'float-up 0.6s ease-out forwards' : 'none'
                            }}
                        >
                            <p className="text-xl md:text-2xl text-amber-200 font-medium mb-2">
                                Bienvenido a nuestra cocina
                            </p>
                            <div className="flex items-center justify-center gap-2 text-amber-300">
                                <span className="w-8 h-0.5 bg-amber-400/50 rounded" />
                                <Flame className="w-5 h-5" />
                                <span className="w-8 h-0.5 bg-amber-400/50 rounded" />
                            </div>
                        </div>

                        {/* Loading indicator */}
                        <div 
                            className="mt-10 flex justify-center gap-2"
                            style={{
                                opacity: animationPhase >= 3 ? 1 : 0,
                                transition: 'opacity 0.5s ease-out'
                            }}
                        >
                            {[0, 1, 2].map(i => (
                                <div
                                    key={i}
                                    className="w-3 h-3 rounded-full bg-amber-400"
                                    style={{
                                        animation: 'dot-bounce 1.4s ease-in-out infinite',
                                        animationDelay: `${i * 0.2}s`
                                    }}
                                />
                            ))}
                        </div>

                        <p 
                            className="mt-4 text-amber-200/70 text-sm tracking-wider"
                            style={{
                                opacity: animationPhase >= 3 ? 1 : 0
                            }}
                        >
                            Cargando menu...
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Menú - Mi Fogón" />
            
            <style>{`
                @keyframes float-bg {
                    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.5; }
                    90% { opacity: 0.5; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
                @keyframes glow-border {
                    0%, 100% { 
                        box-shadow: 0 0 20px rgba(251,146,60,0.5), 
                                    0 0 40px rgba(251,146,60,0.3),
                                    inset 0 0 20px rgba(251,146,60,0.1);
                    }
                    50% { 
                        box-shadow: 0 0 40px rgba(251,146,60,0.8), 
                                    0 0 80px rgba(251,146,60,0.5),
                                    inset 0 0 30px rgba(251,146,60,0.2);
                    }
                }
                @keyframes slide-in-up {
                    from { opacity: 0; transform: translateY(50px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes wiggle-fire {
                    0%, 100% { transform: rotate(-3deg) scale(1); }
                    50% { transform: rotate(3deg) scale(1.1); }
                }
                @keyframes page-flip {
                    0% { transform: perspective(1000px) rotateY(0deg); }
                    50% { transform: perspective(1000px) rotateY(-15deg); }
                    100% { transform: perspective(1000px) rotateY(0deg); }
                }
                .menu-container {
                    animation: slide-in-up 0.8s ease-out forwards, glow-border 3s ease-in-out infinite;
                }
                .nav-button {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .nav-button:hover:not(:disabled) {
                    transform: scale(1.2) translateY(-3px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .nav-button:active:not(:disabled) {
                    transform: scale(0.95);
                }
                .nav-button:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
            `}</style>

            <div 
                className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Floating background elements */}
                {['🍔', '🌮', '🍕', '🍗', '☕', '🔥', '✨', '⭐'].map((emoji, i) => (
                    <div
                        key={i}
                        className="absolute text-3xl md:text-4xl pointer-events-none opacity-40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animation: `float-bg ${10 + Math.random() * 10}s linear infinite`,
                            animationDelay: `${i * 1.5}s`,
                        }}
                    >
                        {emoji}
                    </div>
                ))}

                {/* Header */}
                <header className="relative z-10 pt-6 pb-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span 
                            className="text-4xl md:text-5xl"
                            style={{ animation: 'wiggle-fire 1s ease-in-out infinite' }}
                        >
                            🔥
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-amber-300 drop-shadow-lg"
                            style={{ textShadow: '0 0 30px rgba(251,191,36,0.5)' }}>
                            Restaurante Mi Fogón
                        </h1>
                        <span 
                            className="text-4xl md:text-5xl"
                            style={{ animation: 'wiggle-fire 1s ease-in-out infinite 0.5s' }}
                        >
                            🔥
                        </span>
                    </div>
                    <p className="text-amber-100/80 mt-2 text-sm md:text-lg">
                        ✨ Desliza o usa las flechas para ver el menú ✨
                    </p>
                </header>

                {/* Menu Content */}
                <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-6">
                    <div className="w-full max-w-2xl">
                        
                        {/* Menu Card - CROPPED IMAGE */}
                        <div className="menu-container bg-white rounded-2xl overflow-hidden">
                            <div className="relative bg-gradient-to-b from-amber-50 to-white p-3 md:p-4">
                                {/* Cropped Menu Image - Only the menu rectangle */}
                                <div className="relative bg-white rounded-lg shadow-inner overflow-hidden">
                                    <img 
                                        src={images[currentPage]}
                                        alt={`Menú página ${currentPage + 1}`}
                                        className="w-full h-auto rounded-lg shadow-lg"
                                        style={{
                                            imageRendering: '-webkit-optimize-contrast',
                                            filter: 'contrast(1.02) brightness(1.01)'
                                        }}
                                    />
                                    
                                    {/* Zoom Button */}
                                    <button
                                        onClick={() => setZoomedImage(images[currentPage])}
                                        className="absolute top-4 right-4 p-3 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                        title="Ver en grande"
                                    >
                                        <ZoomIn className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Page Indicator */}
                            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 py-3 px-4 flex items-center justify-between">
                                <span className="text-white font-bold flex items-center gap-2">
                                    <span className="text-xl">📖</span>
                                    Página {currentPage + 1} de {images.length}
                                </span>
                                <div className="flex gap-2">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentPage(idx)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                currentPage === idx 
                                                    ? 'bg-white scale-150 shadow-lg shadow-white/50' 
                                                    : 'bg-white/40 hover:bg-white/70'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-center gap-8 mt-6">
                            <button
                                onClick={() => goToPage('prev')}
                                disabled={currentPage === 0}
                                className="nav-button p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full shadow-xl"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </button>
                            
                            <div className="text-4xl" style={{ animation: 'wiggle-fire 2s ease-in-out infinite' }}>
                                📖
                            </div>
                            
                            <button
                                onClick={() => goToPage('next')}
                                disabled={currentPage === images.length - 1}
                                className="nav-button p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full shadow-xl"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </button>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 py-4 text-center border-t border-white/20 backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-center gap-4 text-amber-100 text-sm px-4">
                        {restaurantInfo.phone && (
                            <a href={`tel:${restaurantInfo.phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
                                <Phone className="h-4 w-4" />
                                {restaurantInfo.phone}
                            </a>
                        )}
                        {restaurantInfo.address && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {restaurantInfo.address}
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-red-300">
                            <Heart className="h-4 w-4 fill-current" />
                            Hecho con amor
                        </span>
                    </div>
                    <p className="text-amber-200/50 text-xs mt-2">
                        © 2026 Mi Fogón - Pablo Ulloa Pereira
                    </p>
                    
                    {/* Developer Contact */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                        <p className="text-amber-100/60 text-xs">
                            💻 ¿Te gustaría implementar este sistema de menú, producción o contabilidad en tu restaurante?
                        </p>
                        <a 
                            href="tel:6135-6385" 
                            className="inline-flex items-center gap-2 mt-1 text-amber-300 hover:text-amber-100 text-sm font-medium transition-colors"
                        >
                            <Phone className="h-4 w-4" />
                            Llama al 6135-6385 - Giovanni Guadamuz
                        </a>
                    </div>
                </footer>
            </div>

            {/* Zoom Modal */}
            {zoomedImage && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2"
                    onClick={() => setZoomedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
                        onClick={() => setZoomedImage(null)}
                    >
                        <X className="h-8 w-8" />
                    </button>
                    
                    {/* Cropped zoomed image */}
                    <div 
                        className="bg-white rounded-lg overflow-hidden shadow-2xl max-w-4xl w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={zoomedImage}
                            alt="Menú ampliado"
                            className="w-full h-auto"
                            style={{
                                imageRendering: '-webkit-optimize-contrast',
                                filter: 'contrast(1.02) brightness(1.01)'
                            }}
                        />
                    </div>
                    
                    {/* Navigation in zoom */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (currentPage > 0) {
                                    setCurrentPage(currentPage - 1);
                                    setZoomedImage(images[currentPage - 1]);
                                }
                            }}
                            disabled={currentPage === 0}
                            className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <span className="py-3 px-5 bg-white/20 rounded-full text-white font-medium">
                            {currentPage + 1} / {images.length}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (currentPage < images.length - 1) {
                                    setCurrentPage(currentPage + 1);
                                    setZoomedImage(images[currentPage + 1]);
                                }
                            }}
                            disabled={currentPage === images.length - 1}
                            className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
