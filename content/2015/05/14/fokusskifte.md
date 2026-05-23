---
title: "Fokusskifte: Høy tilgjengelighet, devops, BIG data, og slike ting.."
layout: post
link: http://blog.kjempekjekt.com/2015/05/14/fokusskifte/
date: 2015-05-14T16:45:29.215Z
tags:
  - kjempekjekt.com
---

![Mascots](http://blog.kjempekjekt.com/uploads/2015/05/open-source-crew.png)

Det kommer et lite fokusskifte på programmeringsbloggen nå. I alle fall for en periode. I årevis har jeg blogget mest om programmeringsspråk, ispedd litt designmønstre, smidige praksiser og generelle meninger om programmering. Nå er jeg inspirert til å gjøre noe litt annet...

Det finnes noen tema som har blitt veldig populære de siste årene. Vi lager løsninger med krav til tilgjengelighet og ytelse. Vi behandler stadig større datamengder, og løsningene våre må kunne endres raskt ved behov. De relaterte *buzz-ordene* er blant annet **DevOps**, **Big Data** og **Microservices**.

Større, vellykkede organisasjoner som Netflix, Twitter, LinkedIn og andre viser vei og deler villig sine verktøy som åpen kildekode. Disse verktøyene, disse byggeklossene for *moderne softwarearkitektur*, blir det stadig viktigere å ha kunnskap om.

Så nå har jeg en laaaaaang liste med løsninger og ting jeg har lyst å teste ut i praksis. Jeg satser på bredde forran dybde; jeg trenger en bedre oversikt over hva som finnes, og hva det kan brukes til. Om man mangler denne kunnskapen rissikerer man å kaste bort mye tid på å selv lage løsninger som bare er halvparten så bra som de som allerede finnes. Så jeg vil altså ta noen av disse teknologiene på en "prøvetur", samtidig som jeg forsøker å dokumentere det jeg lærer her på bloggen.

## Hva vil jeg teste?

### Databaseteknologier

Som utvikler har jeg alltid brukt databaser. Relasjonsdatabasene jeg har hatt et nært forhold til inkluderer MS Access, Oracle og Microsoft SQL Server, men jeg har også brukt MySQL, PostgreSQL og SQLight. For noen år siden eksperimenterte jeg endel med [en objektdatabase som heter db4o](http://blog.kjempekjekt.com/tags/db4o/), de senere årene har jeg vært en flittig bruker av mongoDB, og for bare noen uker siden tok jeg for første gang i bruk Redis i et reelt prosjekt.

Men det finnes så mye mer. Og de ulike teknologiene har ulike styrker, så man kan med fordel kjenne til mange av dem. Jeg ønsker å ta en nærmere titt på for eksempel 
[RethinkDB](http://rethinkdb.com/),
[Couchbase](http://www.couchbase.com/),
[ArangoDB](https://www.arangodb.com/),
[FoundationDB](https://foundationdb.com/),
[VelocityDB](http://www.velocitydb.com/),
[OrientDB](http://orientdb.com/orientdb/),
[Event Store](https://geteventstore.com/),
[HyperDex](http://hyperdex.org/),
[Tarantool](http://www.tarantool.org/) og
[SenseiDB](http://senseidb.com/),

Noen in-memory databaser som virker spennende:
[Aerospike](http://www.aerospike.com/),
[hazelcast](http://hazelcast.com/products/hazelcast/),
[InMemory.Net](http://inmemory.net/),
[memsql](http://www.memsql.com/),

Et par in-process databaser: 
[EJDB](http://ejdb.org/),
[LevelDB](http://leveldb.org/)

Databaser for *timeseries*: 
[druid](http://druid.io/),
[Graphite](http://graphite.readthedocs.org/),
[InfluxDB](http://influxdb.com/),
[Cube](http://square.github.io/cube/),

Og så har vi jo **[hadoop](https://hadoop.apache.org/)** da, og et hav av relaterte teknologier: [Hive](http://hive.apache.org/), [Pig](http://pig.apache.org/), [Spark](http://spark.apache.org/), [Storm](http://storm.apache.org/), [Falcon](http://falcon.apache.org/), [Sqoop](http://sqoop.apache.org/), [Flume](http://flume.apache.org/), [Cassandra](http://cassandra.apache.org/), [HBase](http://hbase.apache.org/), og søk med [Elasticsearch](https://www.elastic.co/) eller [Solr](http://lucene.apache.org/solr/).

### Meldingsformidling og arbeidsdistribusjon

Køsystemet jeg har erfaring med er MSMQ. RabbitMQ og beanstalkd har jeg bare lekt litt med. Nå ønsker jeg å ta en titt på 
[Gearman](http://gearman.org/),
[RestMQ](http://restmq.com/) og
[Kafka](http://kafka.apache.org/). Sistnevnte virker veldig solid, og har mange spennende bruksområder.

### Andre tjenester

Det finnes også verktøy for testing av webtjenester, *service discovery* og koordinering, distribuert konfigurasjon, feiltoleranse, distribuert sikkerhet, monitorering og logging. Noen jeg har sett meg ut er
[keycloak](http://keycloak.jboss.org/),
[gluu](http://www.gluu.org/), 
[montebank](http://www.mbtest.org/), 
[pact](https://github.com/realestate-com-au/pact),
[Hystrix](https://github.com/Netflix/Hystrix),
[Serf](https://www.serfdom.io/),
[Consul](https://consul.io/),
[ZooKeeper](http://zookeeper.apache.org/),
[doozerd](https://github.com/ha/doozerd),
[etcd](https://github.com/coreos/etcd),
[BookKeeper](http://bookkeeper.apache.org/),
[Fabric](http://www.fabfile.org/),
[twemproxy](https://github.com/twitter/twemproxy),
[HAProxy](http://www.haproxy.org/),
[Varnish](https://www.varnish-cache.org/),
[squid](http://www.squid-cache.org/), 
[Packetbeat](http://packetbeat.com/), 
[fluentd](http://www.fluentd.org/) og
[logstash](http://logstash.net/).

## Hva jeg ikke vil fokusere på

Det jeg ikke er så interessert i å bruke tid på (fordi det bare bør virke, men ikke inngår som endel av selve løsningene jeg ønsker å kunne lage) er ting som provisjonering, deployment, hosting og containerteknologi. Jeg planlegger ikke å studere docker, ikke studere chef, puppet, condep eller ansibel, og ikke bruke proprietære *Platform-as-a-Service* løsninger fra for eksempel Microsoft eller Google. Fokuset skal være på open source byggeklosser som er uavhengige av valgt skyleverandør, og som kan inngå i en softwareløsning som typisk leverer høy oppetid, høy kapasitet og høy ytelse. 

## Har du noen tips?

Har du erfaring med en tjeneste som du synes er verdifull, og som jeg ikke har på listen min? Eller kjenner du til noe som de *tøffeste i klassen* bruker, og som du skulle ønske du visste mer om? Legg igjen en kommentar da, så kan jeg vurdere å ta det med.  