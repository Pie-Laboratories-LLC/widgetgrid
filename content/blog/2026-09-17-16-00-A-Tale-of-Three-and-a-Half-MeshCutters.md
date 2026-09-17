# SYNOPSIS

In which our interlocutor brags about a hard-earned, long-running victory and
philosophises a bit about Claude and the true meaning of friendship.  Or
something.  This is the story of implementing Constructive Solid Geometry in a
personal passion project.

# A Tale of Three-and-a-Half MeshCutters

I have been interested in Constructive Solid Geometry (CSG) since first learning
about it.  Several years ago when I came back to my interest in 3d graphics I
decided to undertake CSG.  So I cast around a bit, looking for a modern solution
and stumbled across this paper: [Fast Exact Booleans for Iterated CSG Using
Octree-Embedded BSPs](https://arxiv.org/abs/2103.02486).  This paper
specifically addresses machining and milling applications - i.e., where a CSG
operation is applied sequentially many times using the same shape.  I don't have
a particular interest or application for this, but the paper makes an
interesting challenge.

[![tumblin toruses](./Tumbling-Toruses.png)](https://youtu.be/VAUV2-a9aBU)

By interesting challenge I mean hopelessly intractible and utterly
insurmountable impregnable obstacle.  Well, not completely, but only just.
There is a singular knack in academic paper writing to be able to convey a lot
of information without being excessively informative.  Or maybe vice-versa.
There's definitely a lot of vice in the ultimate solution.

To be fair to the authors, they're writing for a rarified set of fellow
academician hosebags.  Having been through the wringer with this paper, I
estimate there are six total academics working in this research area and every
couple years some permutation of them dreams up new machinery and promptly sets
down to publish for the others.  This paper is not for the faint at heart, and
not least for those who haven't been through the original Naylor paper [Merging
BSP Trees Yields Polyhedral Set
Operations](https://dl.acm.org/doi/10.1145/97880.97892), such as me.  I
wish, like 98% of other Computer Science majors, I'd won the lottery to get in a
Computer Graphics class.  I now possess a copy of Foley and van Dam's classic
_Computer Graphics: Principles and Practice_, so if I ever carry it and my
Cormen book on Algorithms at the same time and trip, there's a real chance I'll
break both feet.

Approaching such a complex and poorly understood problem with such little domain
knowledge, before the advent of AI, naturally I opted to cowboy code it in c#.
Just dive in and implement as literally as I possibly could without unit tests
of any description.  You'd be well within your rights to predict that this would
be a thundering success, that I did indeed devise my purpose for machining
simulations using CSG, and have gone on to become an internationally recognized
CSG hosebag.

Alas.

It's a personal project and I had a truly hard time visualising what the paper
described.  So it was effectively throwaway code - there was a chance it
could've worked and I could've cleaned up the code.  But that's not how it
worked out.  I wound up with templated methods that included lambdas which
included other lambdas, and possibly another nested lambda in there if I'm
remembering correctly and not lost in a fever dream recalling it.

By the time I picked it up again, AI was unavoidable.  A happy confluence of
circumstances gave me a lot of time on my hands 🙄.  And by happy confluence I
mean the mass layoff of government contractors at USDA, of which I was one, in
lieu of a no-bid Palantir contract.  Time on my hands and AI on the march, I
needed to get crackin with it.  So I did several projects, got comfortable, and
settled on Claude.

Alright, I thought.  My work with Claude showed me how proficient it could be
with a well understood problem; I thought, great, I'll just shill this whole
CSG business over to the AI.  It'll get done and I can get on with more
interesting parts of the project.  So I sicced Claude on it.  Claude, then,
proceeded to cowboy code it itself.

My version was able to slice a solid with a plane, but I was stuck building a
new face from where the plane cut the solid.  What's more, it took me long
enough that I reasoned my way out of a core precept of the paper: that complex
non-convex geometries are split into octrees to ensure convexity of meshes
within the quadrants of the octree.

Claude's version did much better; it was able to subtract a smaller cube from a
larger one.  What I was really interested in, though, was subtracting a cube
from a torus - and vice-versa.  Working on that was just a real headache.  I
still didn't firmly grasp the problem domain, and my preferred method of
interacting with Claude - in the browser such that I did the work with input
from it - proved really difficult.  You've seen _The Matrix_, right, or
_Jurassic Park_, or the Sandra Bullock classic _The Net_, or even the television
series, _Z Nation_?  Yes?  No?  What could they possibly have in common?  It's
the depiction of programmers as some sort of automata who look through scrolling
lines of spew on consoles and scream, "eureka!"  I have definitively proved that
wrong.  I did, however, do my fair share of screaming in the course of this
project.

So here's what tended to happen: Claude would get exotic ideas about what could
go wrong.  Honestly not that different from many developers and devops engineers
I've worked with.  It would be obsessed with the idea I didn't recompile the
code, or that a stale copy of something was being compiled.  One of the most
disastrous mistakes I see even senior developers make is to copy parts of a
version controlled repository.  This leads exactly to the sorts of problems to
which Claude was alluding - but I don't make that class of mistake.  (A time or
two I admit, I did forget to recompile, but that was out of literally hundreds
of runs.)

Eventually I came to see this process was doomed.  So I put my foot down and
insisted on a rewrite - the correct way.  I am not a proponent of test driven
development _as a rule_.  I think it's useful in certain circumstances, but not
all.  Unit testing is a real double edged sword.  I am a big proponent of it in
general, but you have to realise it's never going to find all bugs, and it
carries a real risk.  If you push to the 80% coverage many shops strive for, the
code gets ossified and difficult to change.  Not only do you have to change the
code, you have to rewrite and update all the unit tests.  And this can be truly
prohibitive.

But this was the perfect use case for TDD.  We devised invariants which
permitted the implementation of pure functions.  The logic the paper entails is
quite complex, so it's really important to get that right.  Ensure the mesh
manipulation operations are correct and leave the mesh in a consistent state.
Ensure the octrees correctly work on increasingly complex geometries.  And so
forth.  It also must be observed - this is a rigorous mathematical undertaking,
much more germain to unit testing than many projects.  And there's not a real
issue if we have high test coverage; one doesn't casually write or rewrite one's
CSG library any more than one casually ventures to Mordor - same metaphor,
really.  Stinking toruses are rings of doom, I say with no little authority.  So
we set about to rewrite the whole thing using this method.

This method turned out much better: the cube - cube case continued to pass and
we made much better progress on the torus - cube case.  It still devolved into
the same pattern with Claude posing exotic and improbable issues with compiling
the code or having stale copies of things here or there - which just didn't
happen.  And then theories about topology got to be really hard to think through
and reason about, particularly in a really complex BSP tree structure that
resulted from many iterations of recursion.

So I put my foot down again.  Half Edge Meshes are a brilliant data structure in
that really clever way that makes you wonder how anyone ever conceived of such a
beautiful thing in the first place.  They solve any problem you could possibly
have in needing to negotiate a mesh presented as "polygon soup".  In short,
they're _absolutely perfect_ until you go to start using them.  The issue is
that they're simple structures with lots of integer indices to maintain that are
really easy to get wrong.  Rewriting with invariants addressed this; we didn't
allow the mesh to be mutated without all indices being updated.  But then when
capping polygons where cuts happened we relaxed those rules - and that's when
everything really went to hell.

So this time we wrote thin wrapper classes over the components of the Half Edge
Mesh - Vertex, Edge, and Face.  This ultimately led to the floodgates opening
and the torus - cube unit test case passing 😥.  So what's going on in this
video is still comparatively simple, but represents real work.  The shapes in
the video are:

* cube - cube
* torus - cube
* cube - torus
* torus ∪ torus

For the pedantic out there: these aren't real toruses.  These are toroidal
blobs; then again, so are human beings (think about it for half a minute, it's
staggering to realise we're all walking and talking toruses, come down to it.)

I now have a rudimentary camera controller which allows me to control the camera
with the mouse; that's not depicted in this video.  Instead the shapes tumble
independently, allowing their structures to be seen.  Tumbling toruses is a nice
alliteration for this (hard-won) denouement.  Yeah, that's right: I went to
_college_.

I think the most important thing I've learned from this is the first piece of
advice everyone hears about when working with AI - start with unit testing,
always start with unit testing, and for incredibly complex projects that don't
have a lot of references on GitHub, it's necessary to go slowly, incrementally,
and continually build from testing.

I mentioned before that Claude built this website, and did a fantastic job.  It
followed my instructions to a tee and we did scant unit testing.  I think there
are several reasons for this:

* Anthropic has really focused on web development and really specialised Claude
  for this type of development

* there are plugins specifically meant to assist with web development

* there's nothing new in web development.  Websites tend not to be interesting
  because the pointy hairs of the web 2.0 era want to race a website out the
  door as quickly as possible to beat the competitors without too much regard
  for quality or being interesting.  As fundamentally non-technical people they
  can't conceive of interesting technology and as visual learners they can't
  comprehend interesting ideas that are presented to them and as business
  leaders they have to make hard decisions such as not letting developers
  experiment or come up with new ideas.  I won't mention middle-aged
  man-perms or enormous belt-buckle-occluding pot bellies.  Be that as it
  may, there are so many websites like this one on GitHub, I'd really have
  to be far flung to stumble on a pattern that hasn't been implemented 1000
  times before.

* the combined interest and expertise of the CSG hosebag contingent hasn't
  reached critical mass for Anthropic to specialise in it, protestations of the
  ubiquitous advertising notwithstanding ("Add orbital escape velocity!" 😀).
  I think this is a real shortcoming on Anthropic's part as the world's hosebag
  quotient has recently gone up by one

At the end of the day, I'd like to think I could've implemented this on my own.
I think I would've taken it through multiple rewrites and I would definitely
have started with the Naylor paper - I have read it now, and researched Binary
Space Partitioning and Half Edge Meshes much more.  I think it would've taken
significantly longer.  The flip side of that would be that I'd truly have the
right to consider myself a hosebag, if I'm being honest.  Because although I
have a strong understanding now of the papers' finer points and indeed the
implementation through which I've slogged away many late nights and early
mornings, I'm not sure I wouldn't still have to go through all that pain to
rewrite it from scratch.  And I ain't about to do that ;P
