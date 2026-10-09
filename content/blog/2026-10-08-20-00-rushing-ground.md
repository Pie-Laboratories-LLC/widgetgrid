# SYNOPSIS

Stunning progress is reported over a short period of time.  Included - the
animation studio, a silly abandoned maze solving game, and a JSON-powered
building generator.  Some future plans are discussed.

# The ground rushing up

[![GUI Progress](./bâtiment.png)](https://youtu.be/wXXwsEY01Gg?si=l2zFFFgZ-cDxaaXN)

Last time I updated I had a video with four dorks walking a square.  It was
anything but impressive unless you understand the technology behind them.  I
procedurally generate them, meaning I have the potential to generate limitless
different people, men and women of all different descriptions.

Since then, with Claude, I've developed a fairly complete GUI, an animation
studio, and a building generator which works from JSON files.  With the animation
studio I can stitch together motion capture videos from the Carnegie Melon
University Graphics Lab Motion Capture Database.  This allows me, for instance,
to stitch together a running animation with a jumping animation to get a running
jump.  Next, the building generator allows me to generate a fairly wide range of
buildings, so ostensibly I could make a village and populate it with derps 🎉

Suddenly it feels like the ground is rushing up to meet me.  What am I going to
do with this?  I have a backlog of ideas for the ages, but will keep working and
keep logging progress here and on YouTube.  For updates, please subscribe to the
YouTube channel.

I take some pains in the video to describe procedural generation of humanoids;
this is much a work in progress.  Currently, the armature calls a callback which
just returns cylinders.  In the near future, I will update this callback to
generate more properly sculpted humanoids.

The building generator works from JSON, and one of the next features I want to
add is shutters for the windows.  I plan to add several stock styles of
different description, common from medieval times.  But I also want to be able
to define my own shutter structure programmatically.  Another callback.

Longer term, I want to implement LUA for these callbacks.  The idea will be that
end users - whoever they turn out to be - can design their own creatures with
the armature skinner, and custom buildings using similar callbacks.

I want to close this post with an example of the JSON used to make buildings.
This is the building I spend the most time with in the video, an L shaped
stone/wood structure with a _toit en chaume_ - thatched roof.  Please excuse the
French (unless you speak French, then _bon courage_).

The central idea behind the building generator is borrowed from the venerable
computer programming teaching tool logo.  The building's walls are described in
_tracé_ by moving to a point and then lineto'ing around the structure.  In the
future, we'll allow curved walls - fairly arbitrary curves - and turrets.  Also,
I want the roof to be call-backable, too, so users can specify minarets or
domes.  My philosophy: everything that can be call-backable should be
call-backable.  Ugh, what an awful philosophy.

```json
{
  // un L: le grand bras au nord, un bras vers l'est en haut -- 3 m de large partout
  "nom": "ferme en L",
  "graine": 7,
  "murs": {
    "épaisseur": 0.4,
    "intérieur": "plâtre",
    "taille": "rustique",
    "couches": [
      { "matériau": "pierre", "hauteur": 1.0 },
      { "matériau": "planches", "hauteur": 3.0 }
    ]
  },
  "tracé": {
    "cap": "nord",
    "pas": [
      { "avance": 10, "ouvertures": [
          { "genre": "fenêtre", "forme": "arc", "à": 2.0, "largeur": 1.0, "hauteur": 1.3 },
          { "genre": "fenêtre", "forme": "ogive", "à": 6.5, "largeur": 1.0, "hauteur": 1.5 } ] },
      { "droite": 90 }, { "avance": 6 }, { "droite": 90 }, { "avance": 3 },
      { "droite": 90 }, { "avance": 3 }, { "gauche": 90 }, 
      { "avance": 7, "ouvertures": [
          { "genre": "fenêtre", "forme": "chemin", "chemin": "M 0,-0.6 C 0.3,-1.2 1.2,-0.6 0,0.6 C -1.2,-0.6 -0.3,-1.2 0,-0.6 Z",
            "à": 3, "allège": 1.1, "largeur": 0.8, "hauteur": 0.8 }
      ] },
      { "droite": 90 },
      { "ferme": true, "ouvertures": [
          { "genre": "porte", "forme": "rond", "à": 0.9, "largeur": 1.2, "hauteur": 1.9, "seuil": 0.6,
            "vantail": { "jours": [
                { "forme": "chemin", "chemin": "M 0,-0.6 C 0.3,-1.2 1.2,-0.6 0,0.6 C -1.2,-0.6 -0.3,-1.2 0,-0.6 Z",
                  "à": 0.4, "allège": 1.1, "largeur": 0.4, "hauteur": 0.4, "plombs": true } ] }
          }
      ] }
    ]
  },
  "toit": { "forme": "croupe", "pente": 45, "débord": 0.5, "couverture": "chaume",
            "faîtage": { "motif": "pointes", "pas": 0.3, "bande": 0.75, "liens": true, "pasDesCroix": 0.25 }/*,
            "égout": { "largeur": 0.40, "reste": 0.05, "ondulation": 0.05, "onde": 0.60, "dents": 0.015, "pasDesDents": 0.10 },
            "rive":  { "largeur": 0.40, "reste": 0.05, "ondulation": 0.09, "onde": 0.60, "dents": 0.015, "pasDesDents": 0.10 }*/
  }
}

```

