# SYNOPSIS

# A Kubernetes Detour

Much as I'm driven by my personal project, _a boy has to eat_, so I have been
feverishly looking for work.  It's harder to find eligible positions as a senior
architect, so I've been biding my time.  One technology I absolutely love is
Kubernetes.  I've worked with it since 2018, at great peril to my career.  The
industry can be so flighty; if you're in the right place at the right time, you
become the Kubernetes guy irrespective of your abilities.  If not, you have to
have had 10 years production experience managing multiple thousand-node clusters
across cloud platform and on-premisis clusters with specific security tooling if
you want to even be considered for a Kubernetes role.

/rant

One thing I've been curious about for a while is how sidecars and operators
work.  They're definitely not the same thing but they're frequently together.
There are typically custom resource definitions which an operator uses to ensure
some custom resource is kept in a consistent state.  That operator doesn't
always produce its own sidecars; frequently operators exist, for instance, to
ensure logging machinery is always in place or that a postgres cluster is
running well.  But in other cases, like the consul/Envoy service discovery
pattern, they're combined.

![A kitten in every website](https://cataas.com/cat)

My brainstorm for learning about this identified a real gap in modern web
development, and an ironic one given the importance of the domain area to the
modern internet.  Put plainly, most websites just don't have enough kitten
pictures.  Some websites don't even have any at all.  That's just plain wrong.

What occurred to me, given kubernetes' robustness, was that we could add a
service that delivered kitten pictures.  This is best achieved with an
operator.  We want to ensure the kitten service is always up and running and in
fine fetter.  Then, to save the developer the onerous chore of convincing the
business guy kitten pictures were vital to the success of the project, having
to haggle with the product owner to ensure the kitten picture gets prioritised
properly, and so forth, why not just insert the kitten picture for the
developer, thereby completely eliminating the bother.  And the best way to do
that is with a sidecar.  A sidecar that _automatically_ injects kitten pictures
into web applications.

I have gotten to love Anthropic's Claude.  I've mentioned elsewhere my
philosophy with AI.  In this case I leaned heavily on Claude for writing these.
My preferred method is working with Claude in the browser to work through the
idea; in this case I was a little more than a reverse centaur for claude, but
not much.

This is really the value of AI for me; it's turned me into a super-programmer
able to do tasks for which I have no direct training.  It allowed me to create
an operator-and-mutating-admission-webhook following the [Kubebuilder
Book](https://book.kubebuilder.io/) in about a day.  It includes unit tests and
sanity checks to ensure the configuration manager is installed and a suitable
service url is provided for the sidecar.  As mentioned elsewhere, if I were to
do this project again, or implement a _more_ serious mutating admission webhook
/ operator, I would want to go through the [official Go
tour](https://go.dev/tour/) again and follow the Book directly.

In any event, the following are all hosted on github:

* [Kitten Operator](https://github.com/Pie-Laboratories-LLC/kitten-operator):
  this repository includes the docker container for the kitten service app as
  well as the helm chart for the kitten service.

  * [a Docker
    Image](https://github.com/orgs/Pie-Laboratories-LLC/packages/container/package/kitten-operator)
    containing the kitten service

  * [the Helm
    Chart](https://github.com/orgs/Pie-Laboratories-LLC/packages/container/package/kitten-operator-chart)
    that installs the kitten service

* [Kitten Operator
  Controller](https://github.com/Pie-Laboratories-LLC/kitten-operator-controller)
  this repository contains two docker containers - one for the mutating
  admission webhook / operator and the other for the sidecar.  In addition, it
  includes a helm chart which installs it.

  * [a Docker
    Image](https://github.com/orgs/Pie-Laboratories-LLC/packages/container/package/kitten-operator-sidecar)
    cotining the sidecar

  * [a Docker
    Image](https://github.com/orgs/Pie-Laboratories-LLC/packages/container/package/kitten-operator-controller)
    containing the controller.

  * [the Helm
    Chart](https://github.com/orgs/Pie-Laboratories-LLC/packages/container/package/kitten-operator-controller-chart)
    that installs the controller

