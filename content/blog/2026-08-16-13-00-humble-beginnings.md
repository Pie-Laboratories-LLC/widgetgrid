# SYNOPSIS 

This is the first video I've grabbed of the larger application, which I dub
Anonyme for now.  The spinning scene in the middle is a spinning viking library
\-- this is not Hagar the Horrible.  This was part of the Khronos Vulkan
tutorial.  That's nothing to sneeze at, surviving the tutorial should earn
encomiums without end, trumpets playing when you enter rooms and so forth.
Alas.

# HUMBLE BEGINNINGS


[![Humble Beginnings](./humble-beginnings.png)](https://youtu.be/kPc7KQj64TE?si=U8Udg_K2M6GMXtcp)

This is the first video I've grabbed of the larger application, which I dub
Anonyme for now.  The spinning scene in the middle is a spinning viking library
\-- this is not Hagar the Horrible.  This was part of the Khronos Vulkan
tutorial.  That's nothing to sneeze at, surviving the tutorial should earn
encomiums without end, trumpets playing when you enter rooms and so forth.
Alas.

The window that appears on top represents a forthcoming GUI.  It's a milestone
in the development of the Anonyme because it demonstrates that my rendering
engine is capable of rendering glyphs - the letters - and svgs - the emojis.
The little rectangles around the lines of text are bounding boxes that show the
extent of the text, a crucial step in developing a GUI.

It's much more complicated than that.  The original Vulkan tutorial uses "render
pass" rendering, where dynamic rendering was not yet incorporated into the
standard.  It was about a year-and-a-half between when I went through the
tutorial and when I resumed work.  So the GUI is rendered using dynamic
rendering.  The mixture of dynamic and render pass rendering is a significant
milestone in its own right; part of understanding Vulkan is understanding how
its synchronization primitives - barriers, semaphores, and fences work together.

I also made the GUI pipeline live in its own thread.  Threading is one of the
myriad features intrinsic to Vulkan.  It's another thing to master in Vulkan
programming.  Complex 3d applications will have many stages in their rendering,
and the ability to thread them for efficiency is vital.

Finally, I wanted two other threads to interact in a way that a real application
might.  There is a generator thread which sleeps for some random time between
250ms and 250 seconds; when it wakes, it picks a name at random from a list and
sends it to a producer thread.  The producer renders the main window over and
over again, simulating the rendering situation if the GUI window had animated or
particle features.  When the generator notifies of a new name, it replace the
Hello, World message with something more appropriate.  Hence the payoff if you
sit through all two and half minutes; if you sat through 2 and a half seconds
without absconding it's an accomplishment, so perhaps the better phrasing is
you only have to sit through two and a half minutes of this garbage to see
anything happen - _at all_.

You're welcome.
