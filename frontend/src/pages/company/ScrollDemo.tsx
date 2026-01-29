import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ScrollDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure smooth scroll behavior
    if (containerRef.current) {
      containerRef.current.style.scrollBehavior = 'smooth';
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="scroll-container"
      style={{
        height: '100vh',
        overflowY: 'auto',
        scrollSnapType: 'y proximity',
        scrollBehavior: 'smooth',
      }}
    >
      {/* Fixed Header */}
      <header 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'linear-gradient(to bottom, #1a1a2e 0%, #16162a 100%)',
          padding: '1.5rem 2rem',
          textAlign: 'center',
        }}
      >
        <h1 
          style={{
            color: 'white',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          Scroll Demo
        </h1>
      </header>

      {/* Background Pattern */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle, #ddd 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      {/* Section 1: Hero */}
      <section 
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          padding: '2rem',
          background: 'white',
          paddingTop: '100px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '900px' }}
        >
          <h2 
            style={{
              fontSize: 'clamp(3rem, 10vw, 6rem)',
              fontWeight: 900,
              color: '#111',
              marginBottom: '1rem',
              lineHeight: 1.1,
            }}
          >
            WeddingWeb
          </h2>
          <p 
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              color: '#666',
              marginBottom: '2.5rem',
              fontWeight: 400,
            }}
          >
            We build wedding websites that convert.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/company"
              style={{
                padding: '1rem 2.5rem',
                background: '#111',
                color: 'white',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: 'none',
              }}
            >
              Get Started
            </Link>
            <Link
              to="/company/contact"
              style={{
                padding: '1rem 2.5rem',
                background: 'transparent',
                color: '#111',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '2px solid #111',
                transition: 'all 0.3s ease',
              }}
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Section 2: What We Do */}
      <section 
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          scrollSnapAlign: 'center',
          padding: '2rem',
          background: 'white',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '900px' }}
        >
          <h2 
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 900,
              color: '#111',
              marginBottom: '3rem',
              lineHeight: 1.2,
            }}
          >
            We design. build. launch.
          </h2>
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              color: '#444',
              fontWeight: 500,
            }}
          >
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Wedding Websites
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              RSVP System
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Gallery + Invites
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Section 3: Why WeddingWeb */}
      <section 
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          scrollSnapAlign: 'center',
          padding: '2rem',
          background: 'white',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '800px' }}
        >
          <h2 
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 900,
              color: '#111',
              marginBottom: '2rem',
              lineHeight: 1.2,
            }}
          >
            Fast. Elegant. Mobile-first.
          </h2>
          <p 
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.3rem)',
              color: '#666',
              lineHeight: 1.8,
              fontWeight: 400,
            }}
          >
            We craft premium wedding websites with attention to every detail. 
            Your guests will experience a seamless, beautiful interface that 
            works flawlessly on any device. Trust us to make your special day 
            even more memorable.
          </p>
        </motion.div>
      </section>

      {/* Section 4: Repeat Style Text - Gradient Words */}
      <section 
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          scrollSnapAlign: 'center',
          padding: '2rem 4rem',
          background: 'white',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ width: '100%' }}
        >
          <p 
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontWeight: 500,
              marginBottom: '0.5rem',
              color: '#888',
              textDecoration: 'line-through',
            }}
          >
            solve.
          </p>
          <p 
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontWeight: 600,
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #ff6b6b, #ffa07a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ship.
          </p>
          <h2 
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 900,
              color: '#111',
              lineHeight: 1.2,
            }}
          >
            You can <span style={{ letterSpacing: '-0.02em' }}>repeat.</span>
          </h2>
        </motion.div>
      </section>

      {/* Section 5: Final Page with Code Card */}
      <section 
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          scrollSnapAlign: 'start',
          padding: '2rem 4rem',
          paddingTop: '15vh',
          background: 'white',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ width: '100%' }}
        >
          <h2 
            style={{
              fontSize: 'clamp(3rem, 10vw, 7rem)',
              fontWeight: 900,
              color: '#111',
              marginBottom: '4rem',
              lineHeight: 1,
            }}
          >
            Done.
          </h2>
        </motion.div>

        {/* Code Card Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          style={{
            width: '100%',
            background: 'linear-gradient(to bottom, #2d2d3a 0%, #1a1a2e 100%)',
            borderRadius: '16px',
            padding: '0',
            marginTop: '2rem',
            overflow: 'hidden',
          }}
        >
          {/* PRO Pack Badge */}
          <div 
            style={{
              textAlign: 'center',
              padding: '1rem',
              color: '#888',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            get PRO Pack in bio
          </div>

          {/* Code Window */}
          <div 
            style={{
              background: '#1e1e2e',
              borderRadius: '12px',
              margin: '0 1rem 1rem 1rem',
              overflow: 'hidden',
            }}
          >
            {/* Window Header */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: '#252533',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></span>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></span>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27ca40' }}></span>
              </div>
              <span style={{ color: '#888', fontSize: '0.8rem' }}>Comm "scroll" for code</span>
            </div>

            {/* Code Content */}
            <pre 
              style={{
                padding: '1.5rem',
                margin: 0,
                fontSize: 'clamp(0.75rem, 1.5vw, 0.95rem)',
                lineHeight: 1.7,
                overflowX: 'auto',
                fontFamily: "'SF Mono', 'Fira Code', 'Monaco', monospace",
              }}
            >
              <code>
                <span style={{ color: '#c792ea' }}>@layer</span>{' '}
                <span style={{ color: '#82aaff' }}>snap</span>{' '}
                <span style={{ color: '#89ddff' }}>{'{'}</span>
                {'\n'}
                {'  '}
                <span style={{ color: '#f78c6c' }}>html</span>
                <span style={{ color: '#89ddff' }}>,</span>
                {'\n'}
                {'  '}
                <span style={{ color: '#ffcb6b' }}>body</span>{' '}
                <span style={{ color: '#89ddff' }}>{'{'}</span>
                {'\n'}
                {'    '}
                <span style={{ color: '#80cbc4' }}>scroll-snap-type</span>
                <span style={{ color: '#89ddff' }}>:</span>{' '}
                <span style={{ color: '#c3e88d' }}>y proximity</span>
                <span style={{ color: '#89ddff' }}>;</span>
                {'\n'}
                {'    '}
                <span style={{ color: '#80cbc4' }}>scroll-behavior</span>
                <span style={{ color: '#89ddff' }}>:</span>{' '}
                <span style={{ color: '#c3e88d' }}>smooth</span>
                <span style={{ color: '#89ddff' }}>;</span>
                {'\n'}
                {'  '}
                <span style={{ color: '#89ddff' }}>{'}'}</span>
                {'\n'}
                {'\n'}
                {'  '}
                <span style={{ color: '#ffcb6b' }}>.list li</span>{' '}
                <span style={{ color: '#89ddff' }}>{'{'}</span>
                {'\n'}
                {'    '}
                <span style={{ color: '#80cbc4' }}>scroll-snap-align</span>
                <span style={{ color: '#89ddff' }}>:</span>{' '}
                <span style={{ color: '#c3e88d' }}>center</span>
                <span style={{ color: '#89ddff' }}>;</span>
                {'\n'}
                {'  '}
                <span style={{ color: '#89ddff' }}>{'}'}</span>
                {'\n'}
                <span style={{ color: '#89ddff' }}>{'}'}</span>
              </code>
            </pre>
          </div>
        </motion.div>

        {/* Footer Spacer */}
        <div style={{ height: '4rem' }} />
      </section>

      {/* Global Styles */}
      <style>{`
        .scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
        
        @media (max-width: 768px) {
          section {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollDemo;
