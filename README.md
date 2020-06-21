# Screeps

Code used for the sandbox MMO Screeps

You may notice the initial commit has a lot of code to begin with.

This was because I was storing this locally, using git but the version here
was pulled from the latest code deployed on the game, so no commit history.

## The thought process

The idea behind how this project works is something like the following:

- Have a 'role' which controls how an individual creep acts

This means we give a creep object to a role class, then have this role class
be entirely responsible for what this creep does and how it acts.

- Assignments

Creeps can be assigned to other creeps, structures and items in the world.
This allows our creeps to work together, a good example of this is the hauler role.
The hauler first looks for items to collect in the world, when it decides which item
to colllect, it 'assigns' itself to that item. This assignment prevents other haulers
from trying to pick up the same item, making our haulers more efficient.

Creeps/structures can send out requests for resources, which haulers get assigned to.

These assignments are critical to developing new roles as this allows creeps to work
together and not overload a single resources/creep
