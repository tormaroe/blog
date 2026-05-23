---
title: "HEAD@^~"
layout: post
link: http://blog.kjempekjekt.com/2014/03/14/git-head/
date: 2014-03-14T05:47:42.046Z
tags:
  - Git
---
Her følger ukens GIT #7 fra [Stian](http://www.eikeland.se/).

Du har sikkert sett referanser til `HEAD@`, `HEAD~`, `HEAD^` og lignende, men vet du hva alle disse egentlig er? La oss begynne med selve `HEAD`: `HEAD` er rett og slett en peker til _hvor du er nå_. Et Git-depot inneholder som du nok vet en tre-lignende graf (egentlig en DAG), og commits er noder i "treet". `HEAD` er en peker til noden som er utsjekket for øyeblikket.

Utover `HEAD` finnes det også andre navngitte referanser (noder du kan referere med navn), for eksempel greiner (`master`), tags/merker (`v1.0`), eksterne greiner (`origin/master`). Depotes navngitte referanser og hvor de peker til finner du ved å ta en titt på `git show-ref`

## HEAD@, head@, master@ og @

Som vi så i tipset om `git reflog` [i forrige uke](http://blog.kjempekjekt.com/2014/03/08/git-reflog/), så kan man bruke @ til å referere relativt i historien fra vår navigering rundt i depoet. Med andre ord, _hvor vi er nå og stegene vi sekvensielt utførte for å komme oss hit_.

	# Reflog lar oss se historikk på våre operasjoner
	$ git reflog head   # Se global historikk
	$ git reflog master # Se historikk for master-greinen

	# @ lar oss navigere bakover i historikken
	$ git show master@{1}             # En operasjon bakover på master
	$ git show head@{2}               # To operasjoner bakover (globalt)
	$ git show master@{"yesterday"}   # Alternativt på tid/dato

	# Første operasjon som er minst X gammel på gjeldene branch
	$ git show @{"1 week 2 days ago"}

	$ git show @{-1}                  # Forrige branch du sjekket ut

	# Atomløsningen for tirsdag morgen,
	# revert alle mandagscommits på master (mellom søndag og nå)
	$ git revert master@{"last sunday"}..master@{"today at 8:00"}

	# Diff gjeldende branch (master) med forrige utsjekket (gren).
	$ git checkout gren
	$ git checkout master
	$ git diff @{-1}

	# Historikk fra master i går (med tidspunkter):
	$ git reflog master@{"yesterday"}
	525ddab master@{Fri Nov 1 18:18:49 2013 +0100}: commit: Mer fizz
	423efd9 master@{Fri Nov 1 17:07:27 2013 +0100}: commit: Fjernet buzz
	050d410 master@{Fri Nov 1 17:01:36 2013 +0100}: pull: Fast-forward

	# Hva er forskjellen før og etter en pull?
	$ git pull
	$ git diff master master@{1}

## HEAD^ og HEAD~

<img style="float:left" style="margin-right:10px;" src="http://blog.kjempekjekt.com/uploads/2014/03/grener.svg" />

Som vi så kunne vi bruke `@`-operatoren til å navigere i historikken vår. Nå skal vi se på `^` og `~` som lar oss referere relativt i commit-treet.

#### HEAD^

`^` er en foreldre-velger, den lar oss velge blant nodene som er direkte foreldre til en gitt node. I figuren ser vi at master/A har to foreldre, i dette tilfelle vil vi kunne nå `B` med `A^1` og `C` med `A^2`. Dersom bare `^` er angitt antas `^1`, mao `A^=B`.

Flere operatorer kan slåes sammen for å navigere oppover i treet. `A^^ = A^1^1 = A->B->D` for å nå D fra A.

#### HEAD~

`~` lar oss navigere i generasjoner, den vil alltid velge første forelder. `A~ = A~1 = B`, vi navigerer en generasjon oppover i treet via første forelder. `A~2 = A->B->D` - to generasjoner bakover, alltid via første forelder.

## Quiz

	$ git reflog
	0dfbba3 HEAD@{0}: checkout: moving from fizzbuzz to master
	525ddab HEAD@{1}: checkout: moving from master to fizzbuzz

1. `A~3 = ?`
2. `master^2 = ?`
3. `master^2^2^ = ?`
4. `fizzbuzz^~ = ?`
5. `HEAD^2~2 = ?`
6. `HEAD@{1} = ?`
7. `HEAD@{1}~2 = ?`
8. `HEAD@{-1}^2~ = ?`
9. `0dfbba3^^^ = ?`
10. `525ddab^2 = ?`
