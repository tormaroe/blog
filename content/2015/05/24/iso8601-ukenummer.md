---
title: "ISO 8601: Ukenummer i C# og SQL"
layout: post
link: http://blog.kjempekjekt.com/2015/05/24/iso8601-ukenummer/
date: 2015-05-24T09:18:16.469Z
tags:
  - Databaser
  - C#
---
Hvilken uke er vi i? Hvilken dato det er husker jeg som regel, men ukenummer må jeg slå opp. Da er det ganske kjekt at vi har tjenester som [ukenummer.no](http://ukenummer.no/).

Men av og til trenger vi å forholde oss til ukenummer i kode også. Og da bør vi være helt sikre på hva vi snakker om. For ulike steder i verden teller vi uker forskjellig. Hvilken dag uken starter på varierer, og hva som teller som uke nummer 1 varierer også.

**[ISO 8601](http://en.wikipedia.org/wiki/ISO_8601)** er standarden for utvetydig og veldefinert representasjon av dato og tid. Når vi sier "iso-dato" mener vi en dato som er formatert etter reglene i ISO 8601. 

Og standarden har blant annet en [helt presis definisjon](http://en.wikipedia.org/wiki/ISO_week_date) for hvordan man teller uker. Kort fortalt:

> Et ISO år har 52 eller 53 uker, og vi begynner på ukenummer 1 (uke 0 finnes ikke).
> Uker begynner på mandager, og uke nummer 1 er den uken som inneholder 4. januar.

Denne definisjonen bruker vi i Norge, i EU, og de fleste andre land i Europa. I USA, Canada, Kina, Japan, Israel og det meste av Latin-Amerika derimot gjør de det litt anderledes, og ukene begynner på søndag. I midtøsten begynner uken allerede på lørdagen.

## Finne ukenummer i C&#35;

Denne bloggposten er egentlig bare en huskelapp for meg selv; jeg har akkurat hatt behovet for å finne ukenummer, og nå trenger jeg et sted å dokumentere hva jeg har brukt.

Når du trenger å finne ukenummer fra en dato i C# kan du gjøre som dette:

    public static class ISO8601
    {
        public static int WeekOfYear(DateTime date)
        {
            var cal = CultureInfo.CurrentCulture.Calendar;
            var day = (int) cal.GetDayOfWeek(date);
            return cal.GetWeekOfYear(
                time: date.AddDays(4 - (day == 0 ? 7 : day)), 
                rule: CalendarWeekRule.FirstFourDayWeek, 
                firstDayOfWeek: DayOfWeek.Monday);
        }
    }

Denne koden fant jeg nok på nettet et sted, men jeg har pyntet litt på den.

## Ukenummer i SQL Server

Jeg trengte også å beregne ukenummer i SQL Server prosedyrer. Fra versjon 2008 og oppover skal man ha mulighet for å hente ut `iso_week` med funksjonen `DATEPART`, men jeg er stuck med SQL Server 2005 (eller versjon 9 som den egentlig heter, codename *Yukon*).

For å finne ukenummer bruker jeg derfor denne funksjonen, også klippet fra nettet:

    CREATE FUNCTION F_ISO_WEEK_OF_YEAR
      ( @Date datetime )
    RETURNS int
    AS
    BEGIN
      DECLARE @WeekOfYear int
      
      SELECT
        -- Compute week of year as (days since start of year/7)+1
        -- Division by 7 gives whole weeks since start of year.
        -- Adding 1 starts week number at 1, instead of zero.
        @WeekOfYear = (datediff(dd,
          -- Case finds start of year
          CASE
          WHEN NextYrStart <= @date then NextYrStart
          WHEN CurrYrStart <= @date then CurrYrStart
          ELSE PriorYrStart
          END, @date) / 7) + 1
      FROM
        (SELECT
          -- First day of first week of prior year
          PriorYrStart = dateadd(dd,(datediff(
            dd,-53690,dateadd(yy,-1,aa.Jan4))/7)*7,-53690),
          -- First day of first week of current year
          CurrYrStart = dateadd(dd,(datediff(
            dd,-53690,aa.Jan4)/7)*7,-53690),
          -- First day of first week of next year
          NextYrStart = dateadd(dd,(datediff(
            dd,-53690,dateadd(yy,1,aa.Jan4))/7)*7,-53690)
        FROM
          (SELECT
            --Find Jan 4 for the year of the input date
            Jan4 = dateadd(dd,3,dateadd(yy,datediff(yy,0,@date),0))
          ) aa
        ) a
      
      RETURN @WeekOfYear
    END