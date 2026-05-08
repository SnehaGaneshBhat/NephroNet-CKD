import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const makeCapsule = (radius, length, color) => {
  const geometry = new THREE.CapsuleGeometry(radius, length, 18, 28);
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.08,
    roughness: 0.48,
  });
  return new THREE.Mesh(geometry, material);
};

const ThreeWelcome = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.35, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const character = new THREE.Group();
    character.position.y = -0.35;
    scene.add(character);

    const body = makeCapsule(0.72, 1.15, 0xccc3eb);
    body.scale.set(1.04, 1, 0.82);
    character.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 36, 36),
      new THREE.MeshStandardMaterial({
        color: 0xf7efff,
        metalness: 0.04,
        roughness: 0.42,
      })
    );
    head.position.y = 1.35;
    head.scale.set(1.02, 0.96, 0.92);
    character.add(head);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.82, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2.1),
      new THREE.MeshStandardMaterial({ color: 0x4e3b53, roughness: 0.56 })
    );
    hair.position.y = 1.58;
    hair.rotation.x = -0.08;
    character.add(hair);

    const faceGroup = new THREE.Group();
    faceGroup.position.set(0, 1.35, 0.72);
    character.add(faceGroup);

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x211829,
      roughness: 0.2,
      emissive: 0x211829,
      emissiveIntensity: 0.08,
    });
    const blushMaterial = new THREE.MeshStandardMaterial({
      color: 0xd991c4,
      roughness: 0.5,
      emissive: 0xd991c4,
      emissiveIntensity: 0.18,
    });

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 18, 18), eyeMaterial);
    const rightEye = leftEye.clone();
    leftEye.position.set(-0.24, 0.05, 0);
    rightEye.position.set(0.24, 0.05, 0);
    faceGroup.add(leftEye, rightEye);

    const leftBlush = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 18), blushMaterial);
    const rightBlush = leftBlush.clone();
    leftBlush.scale.set(1.5, 0.6, 0.22);
    rightBlush.scale.copy(leftBlush.scale);
    leftBlush.position.set(-0.42, -0.14, -0.02);
    rightBlush.position.set(0.42, -0.14, -0.02);
    faceGroup.add(leftBlush, rightBlush);

    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.012, 8, 32, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x4e3b53, roughness: 0.34 })
    );
    smile.position.set(0, -0.1, 0.02);
    smile.rotation.z = Math.PI;
    faceGroup.add(smile);

    const leftArm = makeCapsule(0.13, 0.86, 0xf7efff);
    leftArm.position.set(-0.86, 0.45, 0.05);
    leftArm.rotation.z = -0.78;
    character.add(leftArm);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.72, 0.84, 0.05);
    character.add(rightArmPivot);

    const rightArm = makeCapsule(0.13, 0.9, 0xf7efff);
    rightArm.position.set(0.18, 0.42, 0);
    rightArm.rotation.z = -0.55;
    rightArmPivot.add(rightArm);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 22, 22),
      new THREE.MeshStandardMaterial({ color: 0xf7efff, roughness: 0.42 })
    );
    hand.position.set(0.43, 0.86, 0.02);
    rightArmPivot.add(hand);

    const leftLeg = makeCapsule(0.14, 0.6, 0x6f4d76);
    const rightLeg = leftLeg.clone();
    leftLeg.position.set(-0.28, -1.02, 0);
    rightLeg.position.set(0.28, -1.02, 0);
    character.add(leftLeg, rightLeg);

    const badge = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x78d7c6,
        roughness: 0.36,
        emissive: 0x78d7c6,
        emissiveIntensity: 0.22,
      })
    );
    badge.position.set(0, 0.42, 0.65);
    badge.scale.set(1, 1, 0.22);
    character.add(badge);

    const sparkleMaterial = new THREE.MeshStandardMaterial({
      color: 0x78d7c6,
      emissive: 0x78d7c6,
      emissiveIntensity: 0.55,
      roughness: 0.3,
    });
    const sparkles = [];
    for (let i = 0; i < 14; i += 1) {
      const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (i % 3) * 0.012, 12, 12), sparkleMaterial);
      const angle = (i / 14) * Math.PI * 2;
      sparkle.position.set(Math.cos(angle) * 2.05, Math.sin(angle * 1.2) * 0.85 + 0.35, Math.sin(angle) * 0.45);
      sparkle.userData = { angle, speed: 0.35 + (i % 4) * 0.04 };
      sparkles.push(sparkle);
      scene.add(sparkle);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const keyLight = new THREE.PointLight(0xffffff, 2.3, 12);
    keyLight.position.set(2.4, 4, 4);
    scene.add(keyLight);
    const roseLight = new THREE.PointLight(0xd991c4, 1.8, 9);
    roseLight.position.set(-3, -1, 3);
    scene.add(roseLight);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let animationId;

    const animate = () => {
      frame += 0.035;
      character.rotation.y = Math.sin(frame * 0.35) * 0.16;
      character.position.y = -0.35 + Math.sin(frame * 0.7) * 0.045;
      rightArmPivot.rotation.z = Math.sin(frame * 2.4) * 0.34 + 0.1;
      rightArmPivot.rotation.x = Math.sin(frame * 2.1) * 0.1;
      head.rotation.z = Math.sin(frame * 0.8) * 0.035;

      sparkles.forEach((sparkle) => {
        const angle = sparkle.userData.angle + frame * sparkle.userData.speed;
        sparkle.position.x = Math.cos(angle) * 2.05;
        sparkle.position.z = Math.sin(angle) * 0.45;
        sparkle.position.y = Math.sin(angle * 1.2) * 0.85 + 0.35;
        sparkle.scale.setScalar(0.8 + Math.sin(frame * 1.8 + sparkle.userData.angle) * 0.22);
      });

      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
    };
  }, []);

  return <div className="three-welcome" ref={mountRef} aria-hidden="true" />;
};

export default ThreeWelcome;
