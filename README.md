# Wild-Life-Tracker

---

## Team
-  E/17/006, Alahakoon A. M. H. H., [e17006@eng.pdn.ac.lk](mailto:e17006@eng.pdn.ac.lk)
-  E/17/176, Kumara W.M.E.S.K, [e17176@eng.pdn.ac.lk](mailto:e17176@eng.pdn.ac.lk)
-  E/17/338, Srimal R. M. L. C., [e17338@eng.pdn.ac.lk](mailto:e17338@eng.pdn.ac.lk)

## Table of Contents
1. [Overview](#Overview)
2. [Goals](#Goals)
3. [Solution Architecture](#solution-Architecture )
4. [Hardware List](#Hardware-List)
5. [System Overview](#System-Overview)
6. [Hardware Design](#Hardware-Design)
7. [Implementation](#Implementation)
8. [Links](#links)

---

## Overview
    Traditional method of wildlife researching in Sri Lanka and many developing as
    well as developed countries is stay in wild areas for long time and seeing animals
    randomly and identify areas that animals are mostly active. This process takes longer
    time and researchers have to stay in the wild are throughout this longer time period.
    So, this is a hard process and sometimes their life is in danger because there is a
    probability to face an attack by wild animals while they are in jungle. And also, some
    animals are hiding when they sense that humans are around. Therefore, this method of
    observing or discovering certain animals is very ineffective for research work.
    A lot of time, money and human resources are spent in vain for traditional tracking
    of wild animals for researchers.

## Goals
-   Introduce a effective and efficient method for wildlife researchs.
-   Find a solution that saves time, money and lives of wildlife researchers.  

## Solution Architecture
    This system is consist of three major components, A hardware unit, A clod server and a web App.
    A hardware unit consist of comera traps, sensors and location tracker. A one unit of thease three
    compnents make a station. Researchers need to setup this station in the researching area. One researcher
    can have more than one stations establish in different places if he/she need. The sensors in a station
    can detect animals when they are in the sensing range and it will trigger the camera. A real time photo
    is captured at that moment and they are stored in the station it self and also they are sent to the 
    cloud server. Then the researcher can analyse these observed data through the web app.

## Hardware List
    | Item                         | Quantity  | Unit Cost  | Total    |
    | -----------------------------|:---------:|:----------:|---------:|
    | Infrared PIR motion Sensor   |   1       | 325 LKR    | 325 LKR  |
    | ESP32 Cam Board              |   1       | 1890 LKR   | 1890 LKR |
    | FTDI connector               |   1       | 470 LKR    | 470 LKR  |
    | Sim800L V2.0 GSm GPRS Module |   1       | 1790 LKR   | 1790 LKR |
    | Ublox NEO_6M GPS module      |   1       | 1390 LKR   | 1390 LKR |
    | 1W LED                       |   1       | 22 LKR     | 22 LKR   |
    | ATmega328p-pu chip           |   1       | 375 LKR    | 375 LKR  |
    | Solar Panel (>6V) 165mA      |   1       | 560 LKR    | 560 LKR  |
    | Battery Charger              |   1       | 120 LKR    | 120 LKR  |
    | 3.7V 1800mAh batteris        |   2       | 225 LKR    | 550 LKR  |
    | Other Expenditures           |   1       | 1000 LKR   | 1000 LKR |

## System Overview


## Hardware Design
    ![Hardware Design](./images/Hardware3.png)

## Implementation


## Links

- <a href = "https://github.com/cepdnaclk/e17-3yp-Wild-Life-Tracker" target = "_blank"> Project Repository </a>
- <a href = "https://cepdnaclk.github.io/e17-3yp-Wild-Life-Tracker/" target = "_blank">Project Page</a>
- <a href = "http://www.ce.pdn.ac.lk/" target = "_blank">Department of Computer Engineering</a>
- <a href = "https://eng.pdn.ac.lk/" target = "_blank">University of Peradeniya</a>


[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
