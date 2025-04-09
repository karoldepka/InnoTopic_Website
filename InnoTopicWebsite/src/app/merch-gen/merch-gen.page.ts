import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import {svgFileData} from "./svg.data";

@Component({
  selector: 'app-merch-gen-page',
  templateUrl: './merch-gen.page.html',
  styleUrls: ['./merch-gen.page.scss'],
})
export class MerchGenPage implements OnInit, AfterViewInit {
  @ViewChild('rendererContainer', {static: false}) rendererContainer!: ElementRef;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, this.getAspectRatio(), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(this.getContainerWidth(), this.getContainerHeight());
    this.rendererContainer.nativeElement.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const loader = new SVGLoader();
    const svgData = loader.parse(svgFileData);

    const paths = svgData.paths;
    const group = new THREE.Group();

    paths.forEach(path => {
      const material = new THREE.MeshBasicMaterial({
        color: path.color || new THREE.Color(Math.random() * 0xffffff),
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const shapes = SVGLoader.createShapes(path);
      shapes.forEach(shape => {
        const geometry = new THREE.ShapeGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      });
    });

    // Center and scale SVG to fit the viewport
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    group.position.sub(center); // Center the group

    // Fit to camera
    const maxDim = Math.max(size.x, size.y);
    const fov = camera.fov * (Math.PI / 180); // Convert vertical FOV to radians
    let distance = maxDim / (2 * Math.tan(fov / 2));
    distance *= 1.2;
    camera.position.z = distance;

    scene.add(group);

    // 🎯 Add control shape: A spinning 3D cube
    const cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    // Position it behind the SVG
    cube.position.set(0, 0, -50);
    scene.add(cube);

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the cube a bit for visibility
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();
  }



  private getContainerWidth(): number {
    return this.rendererContainer.nativeElement.clientWidth;
  }

  private getContainerHeight(): number {
    return this.rendererContainer.nativeElement.clientHeight;
  }

  private getAspectRatio(): number {
    return this.getContainerWidth() / this.getContainerHeight();
  }
}
