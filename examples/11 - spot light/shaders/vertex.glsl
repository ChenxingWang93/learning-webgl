#version 300 es

// Vertex coordinates and normals
in vec4 a_position;
in vec3 a_normal;

// position of the point light in the real world
uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition; 

// World matrices
uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

// varying: normal data
out vec3 v_normal;

// varying: vector from the vertex to the point light
out vec3 v_surfaceToLight;

// varying: vector from the vertex to the camera
out vec3 v_surfaceToView;

// All shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = u_worldViewProjection * a_position;

    // Pass normal to fragment shader
    v_normal = mat3(u_worldInverseTranspose) * a_normal;

    // compute the world position of the surface
    vec3 surfaceWorldPosition = (u_world * a_position).xyz;

    // compute the vector of the surface to the light
    // and pass it to the fragment shader
    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

    // compute the vector of the surface to the view/camera
    // and pass it to the fragment shader
    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}