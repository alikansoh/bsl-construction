'use client';

import { Canvas } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Group } from 'three';

gsap.registerPlugin(ScrollTrigger);

function HouseModel() {
  // شحن مجسم البيت (تأكد من وضع ملف الـ .glb داخل مجلد public/models/)
  // ملاحظة: تأكد من أن أسماء الـ nodes مطابقة للمجسم الخاص بك من برنامج Blender
  const { nodes, materials } = useGLTF('/models/house.glb') as any;
  
  const framingRef = useRef<Group>(null);
  const wallsRef = useRef<Group>(null);

  useLayoutEffect(() => {
    // جدار حماية لـ TypeScript للتأكد من رندرة العناصر
    if (!framingRef.current || !wallsRef.current) return;

    // 1. أنيميشن الهيكل الخشبي: يظهر من الأعلى وينزل لمكانه بالسكرول الأول
    gsap.fromTo(framingRef.current.position, 
      { y: 8, x: 0, z: 0 }, 
      {
        y: 0,
        scrollTrigger: {
          trigger: '.hero-container',
          start: 'top top',
          end: '30% top',
          scrub: 1,
        }
      }
    );

    // 2. أنيميشن الجدران والتشطيبات: تكبر وتظهر بعد استقرار الهيكل
    gsap.fromTo(wallsRef.current.scale, 
      { x: 0, y: 0, z: 0 }, 
      {
        x: 1, y: 1, z: 1,
        scrollTrigger: {
          trigger: '.hero-container',
          start: '35% top',
          end: '65% top',
          scrub: 1,
        }
      }
    );
  }, [nodes]);

  return (
    <group position={[0, -1, 0]} rotation={[0, -Math.PI / 4, 0]}>
      {/* الأساسات والأرضية المحيطة - ظاهرة دائماً في الأسفل */}
      <group name="Foundation">
        <mesh geometry={nodes.Foundation_Mesh.geometry} material={materials.Concrete} />
        <mesh geometry={nodes.Grass_Mesh.geometry} material={materials.Grass} />
      </group>

      {/* الهيكل الخشبي أو الداخلي - يتحكم به الـ framingRef */}
      <group ref={framingRef} name="Framing">
        <mesh geometry={nodes.Wooden_Beams.geometry} material={materials.Wood_Raw} />
      </group>

      {/* الجدران الخارجية، السقف، والشبابيك - يتحكم به الـ wallsRef */}
      <group ref={wallsRef} name="WallsAndRoof">
        <mesh geometry={nodes.External_Walls.geometry} material={materials.Wall_Paint} />
        <mesh geometry={nodes.Windows_Glass.geometry} material={materials.Glass} />
        <mesh geometry={nodes.Roof_Tiles.geometry} material={materials.Roof} />
      </group>
    </group>
  );
}

export default function HouseScene() {
  return (
    <Canvas shadows camera={{ position: [0, 3, 9], fov: 42 }}>
      {/* إضاءة محاكية لأشعة الشمس لتعطي ظلالاً واقعية وعمقاً للمجسم */}
      <directionalLight 
        position={[10, 15, 5]} 
        intensity={1.8} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
      />
      <ambientLight intensity={0.4} />

      {/* إضافة خريطة إضاءة البيئة المحيطة (Environment) لإعطاء الزجاج والمعادن انعكاسات واقعية */}
      <Environment preset="sunset" />

      {/* ظلال ناعمة جداً تحت أساسات المنزل لربطه بالأرضية */}
      <ContactShadows position={[0, -1, 0]} opacity={0.6} scale={20} blur={2.5} far={4} />

      <HouseModel />
    </Canvas>
  );
}