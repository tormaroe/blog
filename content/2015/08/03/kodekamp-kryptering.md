---
title: "Kodekamp: Kryptering med engangsnøkkel"
layout: post
link: http://blog.kjempekjekt.com/2015/08/03/kodekamp-kryptering/
date: 2015-08-03T18:51:52.858Z
tags:
  - Python
  - Kryptering
  - Konkurranse
---

<p style="text-align:center;"><img src="http://blog.kjempekjekt.com/uploads/2015/08/kodekamp1.png"></p>

Dette er første oppgave i **programmeringsbloggens kodekamp**, en uhøytidelig og vennskapelig utviklerkonkurranse. Ønsker du å delta må du løse oppgaven og sende koden på epost til <a href="mailto:kodekamp@kjempekjekt.com">kodekamp@kjempekjekt.com</a> innen mandag 10. august.

Jeg velger et nytt programmeringsspråk for hver oppgave, og denne uken skal du løse oppgaven i **[Python](https://www.python.org/)**. Men oppgaven er ikke vanskeligere enn at du bør kunne løse den ved hjelp av litt *googling*, selv om du ikke har spesielt med Python-erfaring. Faktisk tror jeg du vil synes det er mye kjekkere om du *ikke* kan Python fra før. 

Du må levere programmet i én fil, som må kunne kjøres i Python 2.7.9 (det er det jeg kjører), uten eksterne avhengigheter. Forventet antall kodelinjer: Et sted mellom 10 og 60 kanskje?!

Resultater vil bli presentert og vurdert i en oppfølgingspost. Besvarelsene vil da bli vurdert i forhold til **presisjon** (programmet gjør hva det skal), **lesbarhet** (det er lett å forstå) og **eleganse** (gode abstraksjoner, finesse, interessant løsning).

## Bakgrunn: Engangsnøkler

Jeg har akkurat lest en glimrende Sci-Fi-roman som heter *Seveneves*, skrevet av Neal Stephenson. I boken har vi blant annet noen vitenskapsnerder som er opptatt av ekstrem sikkerhet. For å sende hemmelige meldinger seg imellom bruker de noe som kalles **[one-time pads](https://en.wikipedia.org/wiki/One-time_pad)** (*OTP*, eller på norsk *engangsnøkler*).

<p style="text-align:center;font-size:90%"><img src="http://blog.kjempekjekt.com/uploads/2015/08/one-time-pad.jpg"><br><i>En one-time pad brukt av Soviet, bildet lånt fra Otto Von Guericke Universität Magdeburg.</i></p>

Ved å bruke OTP kan man sende meldinger som *ikke kan* crackes (i teorien). Poenget er at avsender og mottaker deler en hemmelighet: En nøkkel som er like lang som meldingen. For å forstå hvordan dette fungerer bør det være tilstrekkelig å se på [eksempelet i Wikipedia](https://en.wikipedia.org/wiki/One-time_pad).

## Oppgaven

Du skal lage et python-program (script) som kan kjøres i terminalvinduet. Programmet skal ta tre argumenter:

&bull; Første argument forteller programmet om det skal kryptere eller dekryptere (bokstavene `e` og `d` funker fint).

&bull; Andre argument er stien til en fil som inneholder meldingen som skal krypteres eller dekrypteres. Anta at filen er lagret i utf-8.

&bull; Tredje argument er stien til en fil som inneholder en krypteringsnøkkel, også tegnkodet i utf-8.

Når programmet kjøres skal det skrive ut resultatet til terminalvinduet.

Alfabetet som skal benyttes er de 31 bokstavene `ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ .` (legg merke til mellomrom og punktum på slutten), nummerert fra 0 til 30 fra venstre mot høyre. For å kryptere et tegn *plusser* du verdien av tegne sammen med verdien av et tegn i nøkkelen.

Inneholder meldingen et tegn som ikke er i det definerte alfabetet så bare beholder du det som det er (men på egen rissiko).

## Eksempel

Denne lille snutten i C# kan jeg bruke for å generere en nøkkel:

	string alphabeth = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ .";
	int columns = 6;
	int rows = 5;
	
	var rnd = new Random();
	for(int row = 0; row < rows; row++)
	{
		for(int digit = 0; digit < columns * 6; digit++)
		{
			if (digit > 0 && digit % 6 == 0)
				Console.Write("-");
			Console.Write(alphabeth[rnd.Next(0, alphabeth.Length)]);
		}
		Console.WriteLine();
	}

Jeg skriver grupper av seks tegn, separert med en bindestrek, for at det skal være enklere for et menneske (f.eks. en KGB-agent) å lese nøkkelen. Programmet ditt må kunne bruke nøkler generert fra denne koden, samme hvilken verdi jeg har brukt for `columns` og `rows`.

Eksempel på en nøkkel (lagrer den i filen *key1.1tp*):

    ZKD..J-ENLAOL-SCFHWK-ÆJRQØL-TLYTDS-MØOVYU
    BAVIÅQ-BZBNTU-OENZJR-AINWLS-QQJXTS-ÅÅJPFV
    TRMBPB-KGXDE.-ESRØUQ-GJUCXL-GIGOQW-K XFW 
    F.YMME-ÆMMKSA-AAHYIØ-ARZAÆG-ZÆVAXF-AMMÆWV
    XZÅQHK-.ÆVFOP-ORVCWT-ØEERRQ-OZTGKF-SEJRBO

Sett at jeg nå har den krypterte meldingen `BOOKNHÆØÅLRJXTFFGØJPDQIXXÅBBJFNHÅØ.YO` i filen secret1.txt, kan jeg nå bruke programmet mitt til å dekryptere:

    $ python otp.py d secret1.txt key1.1tp
    HELLO WORLD FRA PROGRAMMERINGSBLOGGEN

## Nå er det din tur!

Jeg håper du tar utfordringen - send meg ditt bidrag, jeg gleder meg til å se det! Og husk at det er meningen du skal ha det gøy når du koder :D

Lykke til, og send løsningen din til <a href="mailto:kodekamp@kjempekjekt.com">kodekamp@kjempekjekt.com</a> innen mandag 10. august (én uke fra nå).