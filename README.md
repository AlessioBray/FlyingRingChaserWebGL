# FlyingRingChaserWebGL

Flying Ring Chaser game in WebGL 2.0 for the Computer Graphics course A.Y 2020/2021 at Politecnico di Milano

# Overview
Design and implementation of a flying ring chaser game, an endless run which consists of a starship navigating the space until its life goes to zero.

# Game Design
The idea of the game is to score as many points as possible going through the rings and avoiding the asteroids.
There is a health object that gives additional life and a speed-up object to increase the level of speed of the starship.
Higher the level of speed higher the score obtained by the rings.
The collision with the asteroids decreases the life and slows down your starship (-1 level of speed). The level of speed ranges between 1-4.

# Graphics Design
All the assets have been created and edited with Blender and are shown initially in the showcase before the game:

- starship
- asteroid
- ring
- speed
- health

In the showcase two directional lights are used to enlight the assets. The user can change the color and the direction of these directional lights as well as see the objects from different perspectives by moving the camera.

The space is implemented with a skybox.

