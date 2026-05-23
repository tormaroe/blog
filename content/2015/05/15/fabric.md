---
title: "Kjør kommandoer på mange maskiner med Fabric"
layout: post
link: http://blog.kjempekjekt.com/2015/05/15/fabric/
date: 2015-05-15T05:57:16.838Z
tags:
  - DevOps
  - Software/verktøy
---

![Fabric logo](http://blog.kjempekjekt.com/uploads/2015/05/fabric.png)

**[Fabric](http://www.fabfile.org/)** er et Python-bibliotek og kommandolinjeverktøy som lar deg kjøre shell-kommandoer over SSH til et sett med servere. Systemadministratorer kan for eksempel bruke fabric til å utføre identiske operasjoner på alle noder i et cluster.

Fabric er et nokså populært prosjekt på Github med 5275 stjerner, 942 forks og 107 bidragsytere. Det ble påbegynt julen 2007, og har vært gjevnt aktivt helt frem til nå.

Jeg har ingen erfaring med fabric fra før, men i denne bloggposten vil jeg teste det ut for et konkret scenario hvor jeg kunne tenke meg å bruke det. Testingen gjøres i [vagrant](https://www.vagrantup.com/).

## Mitt scenario: Lastbalanserer med redundans

Tenk deg at du har en webløsning installert på to identiske webservere. Forran disse har vi en server som distribuerer requests til webserverne - altså en lastbalanserer. For å øke kapasiteten og tilgjengelighetsgarantien til systemet kan vi legge til flere webservere i klusteret.

Men lastbalansereren er et *single point of failure*. Derfor har vi en sekundær lastbalanserer som tar over om den første blir utilgjengelig. Denne står i **hot standby**, som vil si at den allerede kjører og er klar for trafikk, og derfor må være identisk med den primære til enhver tid.

![Scenariodiagram](http://blog.kjempekjekt.com/uploads/2015/05/fabric_scenario.png)

Tenk videre at vi av og til har behov for å midlertidig endre hvilke webservere lastbalansereren fordeler trafikk til. Dette gjør vi typisk når vi oppgraderer. Vi tar en webserver ut av clusteret, oppgraderer den, setter den inn igjen, og fortsetter med neste. Måten vi gjør dette på er å editere en konfigurasjonsfil, som har en liste av webnoder. Vi kommenterer rett og slett ut IP-adressen til serveren som skal midlertidig disables. Deretter sier vi til lastbalanserer-programvaren at den skal laste konfigurasjonen på nytt.

For tiden logger vi inn på lastbalansereren med SSH og gjør dette manuelt. Og da bør vi også logge inn på den sekundære og gjøre endringen der - i tilfelle denne lastbalansereren tar over mens vi holder på med oppgraderingen av en webserver. Dette er tungvint, og jeg vil nå i stedet bruke fabric til å holde lastbalansererne i synk.

*(PS: Måten vi oppgraderer clusteret på her vil ikke alltid være mulig om vi har mer enn to webnoder. Da er det ofte nødvendig å vente med å sette nodene inn igjen til den siste noden er tatt ut - for å unngå at man har noder med ulike versjoner med i clusteret samtidig. Men i dette scenariet kan du se bort fra dette.)*

## Vagrant setup

Dette er ikke en Vagrant-tutorial, men jeg inkluderer likevel filen som setter opp de to serverne jeg har brukt i eksperimentet. Kort oppsummert lages det to Ubuntu-bokser med hver sin statiske IP. Jeg installerer python-pip, som jeg så bruker til å installere fabric. Til slutt oppretter jeg filen `somedomain.conf` på hver av serverne. Det er denne filen jeg skal bruke fabric til å modifisere (jeg later som om det er en konfigurasjonsfil for nginx eller noe tilsvarende).

    # -*- mode: ruby -*-
    # vi: set ft=ruby :
    VAGRANTFILE_API_VERSION = "2"
    
    $bootstrap = <<SCRIPT
    
    apt-get update
    apt-get install -y python-pip
    pip install fabric
    
    cat <<EOF > somedomain.conf
    somedomain config
    192.168.36.25
    192.168.36.26
    EOF
    
    SCRIPT
    
    Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
      config.vm.box = "ubuntu/trusty64"
      config.vm.define "fabric_A" do |n1|
        n1.vm.network "private_network", ip: "172.20.20.10"
      end
      config.vm.define "fabric_B" do |n2|
        n2.vm.network "private_network", ip: "172.20.20.11"
      end
      config.vm.provision "shell", inline: $bootstrap
    end

## fabfile

Kommandoene som jeg skal kjøre via Fabric defineres i en fil jeg kaller `fabfile.py`. Filen er på ca 30 linjer, men la meg bryte det opp og beskrive del for del. Aller først må jeg importere funksjonene jeg trenger fra fabric.

    from fabric.api import task, run, sudo

Deretter definerer jeg to varabler: `conf` holder på stien til konfigurasjonsfilen som kommandoene skal jobbe mot, mens `nodes` er en dictionary som inneholder IP-adressene til alle webserverne. Nøkkelen er et tall som vi kommer til å bruke når vi skal fortelle fabric hvilken node vi ønsker å ta ut av clusteret.

    conf = '/home/vagrant/somedomain.conf'
    nodes = {
        '1': '192.168.36.25',
        '2': '192.168.36.26' 
    }

La oss så definere vår første *task*. Jeg kaller den `config`, og sier at den skal være *default* - det vil si at fabric vil kjøre denne om jeg ikke spesifiserer en konkret task. Det `config` gjør er å returnere innholdet i konfigurasjonsfilen.

    @task(default=True)
    def config():
        run("cat " + conf)

Før jeg definerer tasken for å ta ut en node fra clusteret trenger jeg et par hjelpefunksjoner for å editere konfigurasjonsfilen: Én som kommenterer ut en IP-adresse fra filen, og en som kommenterer inn en IP-adresse. For å gjøre filendringene bruker jeg standard Unix **[sed](http://en.wikipedia.org/wiki/Sed)** *(stream editor)*. 

    def _enable(node):
        sudo("sed -i 's/^#{0}/{0}/' {1}".format(node, conf))

    def _disable(node):
        sudo("sed -i 's/^{0}/#{0}/' {1}".format(node, conf))

Nå kan jeg opprette tasken `disable`. Den tar inn en parameter `node` som er nøkkelen til en av IP-adressene. Tasken itererer over alle webnodene, og sålenge det ikke er snakk om noden som skal ut av clusteret så sørger tasken for at de enables. Dermed vil vi kun ha én webnode disablet av gangen.

Etter å ha enablet alle andre, kaller jeg så `_disable` med den riktige IP-adressen. Til slutt kan jeg gjøre en reload av serveren basert på den oppdaterte konfigurasjonen (simulerer bare det her med en *echo*).

    @task
    def disable(node):
        for n in nodes.keys():
            if n != node:
                _enable(nodes[n])
        _disable(nodes[node])
        sudo("echo server reload") # just faking it..

Jeg legger også til en `enable_all` task, som nå bør være selvforklarende:

    @task
    def enable_all():
        for n in nodes.keys():
            _enable(nodes[n])
        sudo("echo server reload") # just faking it..

Jeg må kanskje få poengtere at denne filen kun befinner seg på én av lastbalansererne. Nå burde selvsagt serverne vært identiske (best practise for failover), men poenget er at man ikke trenger å ha noe spesielt på serverne hvor taskene skal kjøres. Fabric kunne for eksempel vært kjørt fra en egen sysadm-server i stedet.

## På tide å kjøre fab

Jeg er nå logget inn på den primære lastbalansereren (127.20.20.10) med SSH. Jeg står i katalogen hvor fabfile.py ligger, og er klar for å kjøre tasks via `fab` (som befinner seg i /usr/local/bin).

### Default task

Først vil jeg kjøre tasken `config` - som var definert som *default*. Jeg bruker opsjon `-H` for å spesifisere hvilke servere tasken skal kjøres på. Her ser du en dump av kommandoen og output:

```
$ fab -H 172.20.20.10,172.20.20.11
[172.20.20.10] Executing task 'config'
[172.20.20.10] run: cat /home/vagrant/somedomain.conf
[172.20.20.10] Login password for 'vagrant':
[172.20.20.10] out: somedomain config
[172.20.20.10] out: 192.168.36.25
[172.20.20.10] out: 192.168.36.26
[172.20.20.10] out:

[172.20.20.11] Executing task 'config'
[172.20.20.11] run: cat /home/vagrant/somedomain.conf
[172.20.20.11] out: somedomain config
[172.20.20.11] out: 192.168.36.25
[172.20.20.11] out: 192.168.36.26
[172.20.20.11] out:

Done.
Disconnecting from 172.20.20.11... done.
Disconnecting from 172.20.20.10... done.
```

Jeg får se hvilke kommandoer som kjøres hvor, og hva output fra disse er. Underveis måtte jeg også taste et passord.., det er sikkert måter å komme unna det på, men det kan nå være greit at det er sånn også.

Som du ser er begge webnodene i utgangspunktet med i clusteret.

### Ta ut en node

Nå kan vi forsøke å kjøre tasken `disable` for å ta ut en webnode fra clusteret. Jeg må da kalle `fab` igjen med listen av servere tasken skal kjøres på, men slenger nå også på tasknavnet, og et kolon etterfulgt av node-nøkkelen (husker du dictionarien `nodes`?).

```
$ fab -H 172.20.20.10,172.20.20.11 disable:1
[172.20.20.10] Executing task 'disable'
[172.20.20.10] sudo: sed -i 's/^#192.168.36.26/192.168.36.26/' /home/vagrant/somedomain.conf
[172.20.20.10] Login password for 'vagrant':
[172.20.20.10] sudo: sed -i 's/^192.168.36.25/#192.168.36.25/' /home/vagrant/somedomain.conf
[172.20.20.10] sudo: echo server reload
[172.20.20.10] out: server reload
[172.20.20.10] out:

[172.20.20.11] Executing task 'disable'
[172.20.20.11] sudo: sed -i 's/^#192.168.36.26/192.168.36.26/' /home/vagrant/somedomain.conf
[172.20.20.11] sudo: sed -i 's/^192.168.36.25/#192.168.36.25/' /home/vagrant/somedomain.conf
[172.20.20.11] sudo: echo server reload
[172.20.20.11] out: server reload
[172.20.20.11] out:

Done.
Disconnecting from 172.20.20.11... done.
Disconnecting from 172.20.20.10... done.
```

Det ser ut til å ha gått greit. Kjører jeg tasken `config` kan jeg få det bekreftet.

Etter at jeg er ferdig med å gjøre det jeg skal med node 1 (oppdatere et eller annet sansynligvis), kan jeg så disable node 2 (og dermed implisit enable node 1 igjen):

```
$ fab -H 172.20.20.10,172.20.20.11 disable:2
[172.20.20.10] Executing task 'disable'
[172.20.20.10] sudo: sed -i 's/^#192.168.36.25/192.168.36.25/' /home/vagrant/somedomain.conf
[172.20.20.10] Login password for 'vagrant':
[172.20.20.10] sudo: sed -i 's/^192.168.36.26/#192.168.36.26/' /home/vagrant/somedomain.conf
[172.20.20.10] sudo: echo server reload
[172.20.20.10] out: server reload
[172.20.20.10] out:

[172.20.20.11] Executing task 'disable'
[172.20.20.11] sudo: sed -i 's/^#192.168.36.25/192.168.36.25/' /home/vagrant/somedomain.conf
[172.20.20.11] sudo: sed -i 's/^192.168.36.26/#192.168.36.26/' /home/vagrant/somedomain.conf
[172.20.20.11] sudo: echo server reload
[172.20.20.11] out: server reload
[172.20.20.11] out:

Done.
Disconnecting from 172.20.20.11... done.
Disconnecting from 172.20.20.10... done.
```

### Enable alle noder

Og til slutt kan jeg gjenopprette clusteret med `enable_all`..

```
$ fab -H 172.20.20.10,172.20.20.11 enable_all
[172.20.20.10] Executing task 'enable_all'
[172.20.20.10] sudo: sed -i 's/^#192.168.36.25/192.168.36.25/' /home/vagrant/somedomain.conf
[172.20.20.10] Login password for 'vagrant':
[172.20.20.10] sudo: sed -i 's/^#192.168.36.26/192.168.36.26/' /home/vagrant/somedomain.conf
[172.20.20.10] sudo: echo server reload
[172.20.20.10] out: server reload
[172.20.20.10] out:

[172.20.20.11] Executing task 'enable_all'
[172.20.20.11] sudo: sed -i 's/^#192.168.36.25/192.168.36.25/' /home/vagrant/somedomain.conf
[172.20.20.11] sudo: sed -i 's/^#192.168.36.26/192.168.36.26/' /home/vagrant/somedomain.conf
[172.20.20.11] sudo: echo server reload
[172.20.20.11] out: server reload
[172.20.20.11] out:

Done.
Disconnecting from 172.20.20.11... done.
Disconnecting from 172.20.20.10... done.
```

## Konklusjon

Fabric var smertefritt å installere på Ubuntu. Å definere taskene var også enkelt, og [dokumentasjonen](http://docs.fabfile.org/en/1.10/) var upåklagelig. Å ha hele Python tilgjengelig i fabfilen var veldig kjekt. Og alt sammen ser ut til å ha virket som jeg håpte. 

Så hvis du har behov for å gjøre nøyaktig samme operasjoner på mer enn én boks, så virker det altså som om Fabrik er et bra verktøy for det.