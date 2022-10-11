import * as THREE from 'three';

// Random number
function randomNumber(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// Listing of Mesh objects
function getMeshObjects(scene, insertGroup) {
  return [
    ...scene.children
      .filter((obj) => obj.type === 'Object3D' && !(obj instanceof THREE.SpotLightHelper))
      .reduce((acc, obj3d) => {
        return [
          ...acc,
          ...(insertGroup ? [obj3d] : []),
          ...obj3d.children
            .filter((obj) => obj.type === 'Object3D' && !(obj instanceof THREE.SpotLightHelper))
            .reduce((acc, obj3d) => {
              return [
                ...acc,
                ...(insertGroup ? [obj3d] : []),
                ...obj3d.children
                  .filter((obj) => obj.type === 'Group')
                  .reduce((acc, group) => {
                    return [
                      ...acc,
                      ...(insertGroup ? [group] : []),
                      ...group.children.filter((obj) => obj.type === 'Mesh')
                    ];
                  }, [])
              ];
            }, [])
        ];
      }, []),
    ...scene.children
      .filter((obj) => obj.type === 'Group')
      .reduce((acc, group) => {
        return [
          ...acc,
          ...(insertGroup ? [group] : []),
          ...group.children.filter((obj) => obj.type === 'Mesh')
        ];
      }, []),
    ...scene.children.filter((obj) => obj.type === 'Mesh')
  ];
}

export { randomNumber, getMeshObjects };
