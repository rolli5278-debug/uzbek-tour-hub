# Ma'lumotlar bazasini yaratadi: public/assets/js/data.js
# Koordinatalar va place_id: Google Maps (coords.json). Faktlar: ochiq ensiklopedik manbalar.
import json, os
BASE = os.path.dirname(os.path.abspath(__file__))

C = json.load(open(os.path.join(BASE, "coords.json")))

CATS = {
    "ansambl": "Ansambllar",
    "maqbara": "Maqbaralar",
    "masjid": "Masjidlar",
    "madrasa": "Madrasalar",
    "minora": "Minoralar",
    "saroy": "Saroy va qal'alar",
    "arxeologik": "Arxeologik yodgorliklar",
    "muzey": "Muzeylar",
}

CITIES = [
    dict(id="samarqand", name="Samarqand", region="Samarqand viloyati", booking="samarkand",
         cover="/images/registango.jpg", unesco="Samarqand — madaniyatlar chorrahasi (UNESCO, 2001)",
         lat=39.6542, lng=66.9750,
         intro="Amir Temur saltanatining poytaxti va Buyuk Ipak yo'lining eng mashhur shaharlaridan biri. Registon, Go'ri Amir va Shohi Zinda kabi temuriylar davri me'morchiligi durdonalari shu yerda."),
    dict(id="buxoro", name="Buxoro", region="Buxoro viloyati", booking="bukhara",
         cover="/images/bukharaher.jpg", unesco="Buxoro tarixiy markazi (UNESCO, 1993)",
         lat=39.7747, lng=64.4286,
         intro="Somoniylar davridan buyon ilm-fan va savdo markazi bo'lgan shahar. Tarixiy markazida yuzlab me'moriy yodgorliklar saqlanib qolgan."),
    dict(id="xiva", name="Xiva", region="Xorazm viloyati", booking="khiva",
         cover="/images/khivaold.jpg", unesco="Ichan Qal'a (UNESCO, 1990)",
         lat=41.3783, lng=60.3639,
         intro="Devorlar bilan o'ralgan Ichan Qal'a — ochiq osmon ostidagi shahar-muzey. Xiva xonligi davrining saroylari, madrasalari va minoralari yaxlit holda saqlangan."),
    dict(id="shahrisabz", name="Shahrisabz", region="Qashqadaryo viloyati", booking="shahrisabz",
         cover="/images/oqsaroy.jpg", unesco="Shahrisabz tarixiy markazi (UNESCO, 2000)",
         lat=39.0578, lng=66.8342,
         intro="Amir Temurning vatani. Oqsaroy qoldiqlari, Dorut Tilovat va Dorus Saodat majmualari temuriylar davri qudratini namoyon etadi."),
    dict(id="toshkent", name="Toshkent", region="Toshkent shahri", booking="tashkent",
         cover=None, cover_pid="hazrati-imom", unesco=None,
         lat=41.3111, lng=69.2797,
         intro="Poytaxtning eski shahar qismida Hazrati Imom majmuasi, Ko'kaldosh madrasasi va Shayxontohur maqbaralari kabi asrlik yodgorliklar joylashgan."),
    dict(id="qoqon", name="Qo'qon", region="Farg'ona viloyati", booking="kokand",
         cover="/images/kokand.jpg", unesco=None,
         lat=40.5357, lng=70.9465,
         intro="XVIII–XIX asrlarda Qo'qon xonligining poytaxti. Xudoyorxon o'rdasi, Jome masjidi va xonlar dahmasi shahar tarixining guvohlaridir."),
    dict(id="termiz", name="Termiz", region="Surxondaryo viloyati", booking="termez",
         cover=None, cover_pid="hakim-termiziy", unesco=None,
         lat=37.2242, lng=67.2783,
         intro="Amudaryo bo'yidagi qadimiy shahar. Bu yerda buddaviy monastirlar qoldiqlari va islom davri maqbaralari yonma-yon uchraydi."),
    dict(id="qoraqalpogiston", name="Qoraqalpog'iston", region="Qoraqalpog'iston Respublikasi", booking="nukus",
         cover=None, cover_pid="ayozqala", unesco=None,
         lat=42.4531, lng=59.6103,
         intro="Qadimgi Xorazm hududi. Cho'l bag'ridagi qal'alar va Mizdahkan nekropoli ming yillik tarixni saqlab kelmoqda."),
]

local_img = {
    "registon": "/images/registango.jpg",
    "ark": "/images/bukharaher.jpg",
    "ichan-qala": "/images/khivaold.jpg",
    "xudoyorxon": "/images/kokand.jpg",
    "oqsaroy": "/images/oqsaroy.jpg",
}

M = [
 # --- Samarqand
 dict(id="registon", city="samarqand", cat="ansambl", name="Registon maydoni", en="Registan Square", year="1417 – 1660",
      builder="Ulug'bek, Yalangto'sh Bahodir", unesco=True,
      short="Uch madrasa — Ulug'bek, Sherdor va Tillakori — o'rab turgan Samarqandning bosh maydoni.",
      text="Registon ansambli uch madrasadan iborat: Ulug'bek madrasasi (1417–1420), Sherdor madrasasi (1619–1636) va Tillakori madrasasi (1646–1660). Maydon asrlar davomida shaharning savdo va jamoat markazi bo'lgan. Bugun u O'zbekistonning eng taniqli ramzlaridan biri."),
 dict(id="gur-amir", city="samarqand", cat="maqbara", name="Go'ri Amir maqbarasi", en="Gur-e-Amir Mausoleum", year="1403 – 1404",
      builder="Amir Temur farmoni bilan", unesco=True,
      short="Amir Temur va temuriylar sulolasi vakillari dafn etilgan qovurg'asimon gumbazli maqbara.",
      text="Maqbara dastlab Temurning nabirasi Muhammad Sulton uchun qurilgan. 1405-yilda Amir Temur ham shu yerda dafn etilgan, keyinroq Mirzo Ulug'bek va sulolaning boshqa vakillari ham. Feruza qovurg'asimon gumbazi va oltin bezakli ichki zali bilan mashhur."),
 dict(id="bibixonim", city="samarqand", cat="masjid", name="Bibixonim masjidi", en="Bibi-Khanym Mosque", year="1399 – 1404",
      builder="Amir Temur farmoni bilan", unesco=True,
      short="Temur davrining eng ulkan jome masjidlaridan biri, ulkan peshtoq va gumbazlar.",
      text="Amir Temurning Hindiston yurishidan so'ng qurdirilgan masjid o'z davrining eng yirik inshootlaridan biri bo'lgan. Asrlar davomida zilzilalardan zarar ko'rgan, XX asrda katta qismi qayta tiklangan."),
 dict(id="shohi-zinda", city="samarqand", cat="maqbara", name="Shohi Zinda majmuasi", en="Shah-i-Zinda Necropolis", year="XI – XIX asrlar",
      builder="Turli davrlar (asosan XIV–XV asrlar)", unesco=True,
      short="Ko'k koshinlar bilan bezatilgan maqbaralar ko'chasi — temuriylar davri nekropoli.",
      text="Afrosiyob tepaligi etagidagi nekropol bir necha asr davomida shakllangan. Maqbaralarning aksariyati XIV–XV asrlarga tegishli bo'lib, sirlangan koshin va naqshlarning eng nafis namunalarini saqlab qolgan. Rivoyatlarga ko'ra, majmua Qusam ibn Abbos qabri atrofida vujudga kelgan."),
 dict(id="ulugbek-rasadxona", city="samarqand", cat="arxeologik", name="Ulug'bek rasadxonasi", en="Ulugh Beg Observatory", year="1420-yillar",
      builder="Mirzo Ulug'bek", unesco=True,
      short="Ulug'bek qurdirgan rasadxonaning yer ostidagi ulkan sekstant qoldig'i va muzey.",
      text="Mirzo Ulug'bek rasadxonasida mingdan ortiq yulduz katalogi tuzilgan. Rasadxona Ulug'bek vafotidan keyin vayron bo'lgan. Uning qoldiqlarini 1908-yilda arxeolog V. Vyatkin topgan. Bugun bu yerda asbobning yer ostidagi yoyi va kichik muzey bor."),
 dict(id="afrosiyob", city="samarqand", cat="muzey", name="Afrosiyob muzeyi", en="Afrasiyab Museum", year="Qadimiy shahar o'rni",
      builder="—", unesco=True,
      short="Qadimiy Samarqand o'rnidagi muzey: VII asr so'g'd devoriy suratlari.",
      text="Muzey qadimiy Samarqand — Afrosiyob shahar xarobalari yonida joylashgan. Unda VII asrga oid mashhur so'g'd devoriy suratlari (\"Elchilar zali\") va qazishmalarda topilgan buyumlar namoyish etiladi."),
 # --- Buxoro
 dict(id="ark", city="buxoro", cat="saroy", name="Buxoro Arki", en="Ark of Bukhara", year="Qadimiy qal'a (hozirgi ko'rinishi XVI–XX asrlar)",
      builder="Turli sulolalar", unesco=True,
      short="Buxoro hukmdorlarining qal'asi va qarorgohi — shahar ustida qad rostlagan ulkan istehkom.",
      text="Ark Buxoroning eng qadimiy qismi bo'lib, asrlar davomida hukmdorlar qarorgohi vazifasini o'tagan. 1920-yilgacha Buxoro amirlari shu yerda yashagan. Bugun qal'a ichida muzey ekspozitsiyalari joylashgan, devorlaridan eski shahar manzarasi ko'rinadi."),
 dict(id="poi-kalon", city="buxoro", cat="ansambl", name="Poi Kalon majmuasi", en="Po-i-Kalyan Complex", year="1127 – XVI asr",
      builder="Arslonxon (minora), Shayboniylar", unesco=True,
      short="Minorai Kalon, Kalon masjidi va Mir Arab madrasasidan iborat Buxoroning markaziy ansambli.",
      text="Ansamblning eng qadimiy qismi — 1127-yilda Arslonxon qurdirgan, balandligi 46 metrga yaqin Minorai Kalon. Kalon masjidi XVI asr boshida, Mir Arab madrasasi esa 1530-yillarda barpo etilgan."),
 dict(id="somoniy", city="buxoro", cat="maqbara", name="Ismoil Somoniy maqbarasi", en="Samanid Mausoleum", year="IX – X asrlar",
      builder="Somoniylar sulolasi", unesco=True,
      short="Markaziy Osiyodagi eng qadimiy islomiy maqbaralardan biri — g'ishtdan to'qilgandek naqshlar.",
      text="Somoniylar sulolasi oilaviy maqbarasi pishiq g'ishtning o'zidan yaratilgan murakkab naqshlari bilan mashhur. Kub shaklidagi bino va gumbaz o'rta asr me'morchiligining nodir namunasi hisoblanadi."),
 dict(id="labi-hovuz", city="buxoro", cat="ansambl", name="Labi Hovuz ansambli", en="Lyabi-Hauz Ensemble", year="1568 – 1622",
      builder="Nodir Devonbegi va boshqalar", unesco=True,
      short="Hovuz atrofidagi Ko'kaldosh madrasasi, Nodir Devonbegi xonaqohi va madrasasi.",
      text="Ansambl hovuz atrofida shakllangan: Ko'kaldosh madrasasi (1568–1569), Nodir Devonbegi xonaqohi (1620) va madrasasi (1622). Hovuz bo'yi bugun ham Buxoro eski shahrining eng jonli joylaridan biri."),
 dict(id="chor-minor", city="buxoro", cat="madrasa", name="Chor Minor", en="Chor Minor", year="1807",
      builder="Xalifa Niyozqul", unesco=True,
      short="To'rt feruza gumbazli minorachali bino — yo'qolgan madrasaning darvozaxonasi.",
      text="1807-yilda savdogar Xalifa Niyozqul mablag'i hisobiga qurilgan madrasa majmuasidan faqat to'rt minorali darvozaxona saqlanib qolgan. O'ziga xos silueti bilan Buxoroning eng tanish obidalaridan biri."),
 dict(id="sitorai-mohi-xosa", city="buxoro", cat="saroy", name="Sitorai Mohi Xosa saroyi", en="Sitorai Mohi Khosa Palace", year="1912 – 1918",
      builder="Amir Olimxon davrida", unesco=False,
      short="Buxoroning so'nggi amirlari yozgi qarorgohi — Sharq va Yevropa uslublari uyg'unligi.",
      text="Shahar shimolidagi yozgi saroy so'nggi Buxoro amiri Olimxon davrida qurilgan. Saroyda mahalliy ustalar san'ati Yevropa me'morchiligi bilan uyg'unlashgan. Bugun bu yerda amaliy san'at muzeyi joylashgan."),
 dict(id="bahouddin", city="buxoro", cat="maqbara", name="Bahouddin Naqshband majmuasi", en="Bahouddin Naqshband Complex", year="XVI asrdan",
      builder="Turli davrlar", unesco=False,
      short="Naqshbandiya tariqati asoschisi Bahouddin Naqshband (1318–1389) ziyoratgohi.",
      text="Buxorodan taxminan 12 km shimoli-sharqda joylashgan majmua mashhur so'fiy Bahouddin Naqshband qabri atrofida shakllangan. Bu yer bugun ham muhim ziyoratgoh hisoblanadi."),
 # --- Xiva
 dict(id="ichan-qala", city="xiva", cat="ansambl", name="Ichan Qal'a", en="Itchan Kala", year="Asosan XVIII – XIX asrlar",
      builder="Xiva xonlari", unesco=True,
      short="Devorlar bilan o'ralgan ichki shahar — 50 dan ortiq tarixiy obida bir joyda.",
      text="Ichan Qal'a — Xivaning devorlar bilan o'ralgan ichki shahri. Uning tor ko'chalarida saroylar, masjidlar, madrasalar va minoralar zich joylashgan. 1990-yilda O'zbekistonda birinchi bo'lib UNESCO Butunjahon merosi ro'yxatiga kiritilgan."),
 dict(id="kalta-minor", city="xiva", cat="minora", name="Kalta Minor", en="Kalta Minor Minaret", year="1852 – 1855",
      builder="Muhammad Aminxon", unesco=True,
      short="To'liq sirlangan koshin bilan qoplangan, nihoyasiga yetmagan yo'g'on minora.",
      text="Muhammad Aminxon eng baland minorani qurdirmoqchi bo'lgan, biroq 1855-yilda xon halok bo'lgach, qurilish to'xtagan. Shu sababli minora kalta va yo'g'on bo'lib qolgan. Feruza, yashil va oq koshinlari bilan Xivaning ramziga aylangan."),
 dict(id="islom-xoja", city="xiva", cat="minora", name="Islom Xo'ja minorasi", en="Islam Khodja Minaret", year="1908 – 1910",
      builder="Vazir Islom Xo'ja", unesco=True,
      short="Ichan Qal'aning eng baland minorasi, tepasidan butun shahar ko'rinadi.",
      text="Xiva vaziri Islom Xo'ja qurdirgan madrasa va minora Xiva me'morchiligining so'nggi yirik namunalaridan. Minora Ichan Qal'aning eng baland inshooti bo'lib, tor zinapoyalar orqali tepasiga chiqish mumkin."),
 dict(id="xiva-juma", city="xiva", cat="masjid", name="Xiva Juma masjidi", en="Juma Mosque of Khiva", year="XVIII asr (qadimiy poydevorda)",
      builder="Xiva xonlari", unesco=True,
      short="200 dan ortiq o'ymakor yog'och ustunli \"ustunlar o'rmoni\".",
      text="Masjidning tomini 200 dan ortiq o'ymakor yog'och ustun ko'tarib turadi. Ustunlarning bir qismi ancha qadimiy davrlarga oid. Ikki tuynukdan tushadigan yorug'lik zalga o'ziga xos muhit beradi."),
 dict(id="toshhovli", city="xiva", cat="saroy", name="Toshhovli saroyi", en="Tash Hauli Palace", year="1830-yillar",
      builder="Olloqulixon", unesco=True,
      short="Uch hovli va o'ymakor ustunlar — Xiva xonlarining dabdabali qarorgohi.",
      text="Olloqulixon davrida qurilgan saroy 150 dan ortiq xona va uchta asosiy hovlidan iborat: haram, qabulxona va sudxona. Ko'k-oq koshinlar va o'ymakor yog'och ustunlar saroyning asosiy bezagi."),
 dict(id="pahlavon-mahmud", city="xiva", cat="maqbara", name="Pahlavon Mahmud maqbarasi", en="Pahlavan Mahmud Mausoleum", year="XIX asr boshi (hozirgi ko'rinishi)",
      builder="Xiva xonlari", unesco=True,
      short="Shoir va polvon Pahlavon Mahmud ziyoratgohi, katta feruza gumbaz ostida.",
      text="Xivaning homiysi sanalgan shoir, faylasuf va polvon Pahlavon Mahmud (XIV asr) qabri ustida qurilgan maqbara. Ichki xonalari ko'k-oq sirlangan koshinlar bilan qoplangan. Bugun ham faol ziyoratgoh."),
 # --- Shahrisabz
 dict(id="oqsaroy", city="shahrisabz", cat="saroy", name="Oqsaroy", en="Ak-Saray Palace", year="1380 – 1404",
      builder="Amir Temur", unesco=True,
      short="Amir Temur saroyining ulkan peshtoq qoldiqlari.",
      text="Amir Temur o'z vatanida qurdirgan saroydan bugun ulkan peshtoqning ikki qanoti saqlanib qolgan. Qoldiqlarning ko'lami saroyning dastlabki ulug'vorligi haqida tasavvur beradi."),
 dict(id="dorut-tilovat", city="shahrisabz", cat="masjid", name="Dorut Tilovat majmuasi", en="Dorut Tilavat Complex", year="1373 – 1438",
      builder="Amir Temur, Mirzo Ulug'bek", unesco=True,
      short="Ko'k Gumbaz masjidi, Shamsiddin Kulol va Gumbazi Sayyidon maqbaralari.",
      text="Majmuaga Shamsiddin Kulol maqbarasi (1373–1374), Mirzo Ulug'bek otasi Shohruh sharafiga qurdirgan Ko'k Gumbaz masjidi (1435) va Gumbazi Sayyidon maqbarasi kiradi."),
 dict(id="dorus-saodat", city="shahrisabz", cat="maqbara", name="Dorus Saodat majmuasi", en="Dorus Saodat Complex", year="1376-yildan",
      builder="Amir Temur", unesco=True,
      short="Temurning to'ng'ich o'g'li Jahongir maqbarasi va Temur uchun tayyorlangan sag'ana.",
      text="Majmua 1376-yilda vafot etgan Jahongir Mirzo uchun qurilgan. Yaqinida Amir Temurning o'zi uchun tayyorlangan, biroq foydalanilmagan yer osti sag'anasi bor."),
 # --- Toshkent
 dict(id="hazrati-imom", city="toshkent", cat="ansambl", name="Hazrati Imom majmuasi", en="Hazrati Imam Complex", year="XVI asr – 2007",
      builder="Turli davrlar", unesco=False,
      short="Qaffol Shoshiy maqbarasi, Baroqxon madrasasi va Usmon Mushafi saqlanadigan kutubxona.",
      text="Majmua XVI asrda qurilgan Qaffol Shoshiy maqbarasi va Baroqxon madrasasi atrofida shakllangan. Bu yerdagi kutubxonada qadimiy Qur'on qo'lyozmasi — Usmon Mushafi saqlanadi. Hazrati Imom jome masjidi 2007-yilda qurilgan."),
 dict(id="kokaldosh", city="toshkent", cat="madrasa", name="Ko'kaldosh madrasasi", en="Kukeldash Madrasah", year="XVI asr",
      builder="Vazir Qulbobo Ko'kaldosh", unesco=False,
      short="Chorsu yonidagi Toshkentning eng yirik saqlanib qolgan madrasalaridan biri.",
      text="XVI asrda Shayboniylar davrida qurilgan madrasa ulkan peshtoqi va hujralar bilan o'ralgan hovlisi bilan ajralib turadi. Chorsu bozori yonida joylashgan."),
 dict(id="shayxontohur", city="toshkent", cat="maqbara", name="Shayxontohur majmuasi", en="Sheikhantaur Complex", year="XIV – XV asrlar",
      builder="Turli davrlar", unesco=False,
      short="Shayx Xovendi at-Tohur, Yunusxon va Qaldirg'ochbiy maqbaralari.",
      text="Majmua Toshkentning homiysi sanalgan Shayx Xovendi at-Tohur maqbarasi atrofida shakllangan. Unga Yunusxon va Qaldirg'ochbiy maqbaralari ham kiradi."),
 # --- Qo'qon
 dict(id="xudoyorxon", city="qoqon", cat="saroy", name="Xudoyorxon o'rdasi", en="Palace of Khudayar Khan", year="1863 – 1871",
      builder="Xudoyorxon", unesco=False,
      short="Qo'qon xonligining so'nggi va eng mahobatli saroyi, rangli koshinli peshtoq.",
      text="Qo'qon xonligining so'nggi hukmdori Xudoyorxon qurdirgan saroy ko'p hovlili majmua bo'lgan. Uzun koshinli peshtoqi va naqshli shiftlari saqlanib qolgan. Bugun bu yerda o'lkashunoslik muzeyi joylashgan."),
 dict(id="qoqon-jome", city="qoqon", cat="masjid", name="Qo'qon Jome masjidi", en="Jome Mosque of Kokand", year="1819 – 1822",
      builder="Umarxon farmoni bilan", unesco=False,
      short="98 ta qizil daraxt ustunli uzun ayvon va 22 metrli minora.",
      text="Umarxon davrida qurilgan jome masjidi katta hovli atrofida joylashgan. 98 ustunli uzun ayvon va hovli o'rtasidagi minora uning asosiy belgilari. Hozir majmuada muzey va hunarmandlar ustaxonalari bor."),
 dict(id="norbotabiy", city="qoqon", cat="madrasa", name="Norbo'tabiy madrasasi", en="Norbutabiy Madrasah", year="1799",
      builder="Norbo'tabiy", unesco=False,
      short="Qo'qon xonligining saqlanib qolgan eng qadimiy binolaridan biri.",
      text="Qo'qon hukmdori Norbo'tabiy davrida qurilgan madrasa. Uning ortida xonlar qabristoni — Dahmai Shohon joylashgan."),
 dict(id="modarixon", city="qoqon", cat="maqbara", name="Modarixon maqbarasi", en="Modari Khan Mausoleum", year="1825",
      builder="Nodirabegim", unesco=False,
      short="Umarxonning onasi uchun qurilgan, rangli koshinli peshtoqli maqbara.",
      text="Maqbara Umarxonning onasi uchun Nodirabegim tashabbusi bilan qurilgan. Keyinchalik sulola ayollarining dafn joyiga aylangan."),
 dict(id="dahmai-shohon", city="qoqon", cat="maqbara", name="Dahmai Shohon", en="Dakhmai Shokhon", year="1825 (Umarxon davri)",
      builder="Umarxon davrida", unesco=False,
      short="Qo'qon xonlari va ularning yaqinlari dafn etilgan sulola qabristoni.",
      text="Norbo'tabiy madrasasi ortidagi qabristonda Qo'qon xonlari va ularning qarindoshlari dafn etilgan. O'ymakor eshiklari bilan mashhur."),
 dict(id="kamol-qozi", city="qoqon", cat="madrasa", name="Kamol Qozi madrasasi", en="Kamol Qozi (Amin Beg) Madrasah", year="1830 – 1832",
      builder="Qo'qon qozisi Kamol", unesco=False,
      short="Madalixon davrida qurilgan, koshinli peshtoqli madrasa.",
      text="Madrasa Qo'qon qozisi Kamol tomonidan Muhammad Alixon (Madalixon) hukmronligi davrida qurilgan. Ayrim manbalarda Amin Beg madrasasi nomi bilan ham uchraydi."),
 dict(id="hamza-muzey", city="qoqon", cat="muzey", name="Hamza uy-muzeyi", en="Hamza Hakimzoda Niyoziy House Museum", year="XIX asr uyi (muzey 1989)",
      builder="—", unesco=False,
      short="Shoir va dramaturg Hamza Hakimzoda Niyoziy yashagan an'anaviy qo'qoncha uy.",
      text="XIX asrga oid an'anaviy uyda Hamza Hakimzoda Niyoziy hayoti va ijodiga bag'ishlangan muzey joylashgan. Uy o'sha davr turmush tarzini aks ettiradi."),
 # --- Termiz
 dict(id="sulton-saodat", city="termiz", cat="maqbara", name="Sulton Saodat majmuasi", en="Sultan Saodat Ensemble", year="X – XVII asrlar",
      builder="Termiz sayyidlari", unesco=False,
      short="Termiz sayyidlari sulolasining bir necha asr davomida shakllangan maqbaralar majmuasi.",
      text="Majmua Termiz sayyidlari sulolasi maqbaralaridan tashkil topgan va bir necha asr davomida kengaygan. Gumbazli maqbaralar va peshtoqlar o'rta asr Termiz me'morchiligini namoyon etadi."),
 dict(id="hakim-termiziy", city="termiz", cat="maqbara", name="Al-Hakim at-Termiziy maqbarasi", en="Al-Hakim at-Termizi Mausoleum", year="XI – XV asrlar",
      builder="Turli davrlar", unesco=False,
      short="IX asr mutafakkiri al-Hakim at-Termiziy ziyoratgohi, qadimiy Termiz xarobalari yonida.",
      text="So'fiy olim al-Hakim at-Termiziy (IX asr) qabri ustidagi maqbara o'ymakor terrakota bezaklari bilan mashhur. Majmua Amudaryo bo'yida, qadimiy Termiz shahri o'rni yonida joylashgan."),
 dict(id="fayoztepa", city="termiz", cat="arxeologik", name="Fayoztepa", en="Fayaz Tepa", year="I – III asrlar",
      builder="Kushonlar davri", unesco=False,
      short="Kushonlar davriga oid buddaviy monastir va stupa qoldiqlari.",
      text="Fayoztepa — milodiy I–III asrlarga oid buddaviy monastir. Qazishmalarda stupa, ibodatxona va hujralar qoldiqlari topilgan. Yaqinida Qoratepa monastiri joylashgan."),
 # --- Qoraqalpog'iston
 dict(id="mizdahkan", city="qoraqalpogiston", cat="arxeologik", name="Mizdahkan nekropoli", en="Mizdakhan Necropolis", year="Miloddan avvalgi davrdan",
      builder="Turli davrlar", unesco=False,
      short="Xo'jayli yaqinidagi qadimiy nekropol — maqbaralar va rivoyatlar maskani.",
      text="Bir necha tepalikka yoyilgan nekropol asrlar davomida qabriston sifatida foydalanilgan. Mazlumxon Sulu maqbarasi va boshqa obidalar shu yerda. Mizdahkan bugun ham ziyoratgoh."),
 dict(id="ayozqala", city="qoraqalpogiston", cat="saroy", name="Ayozqal'a", en="Ayaz Kala", year="Mil. avv. IV asr – milodiy VIII asr",
      builder="Qadimgi Xorazm", unesco=False,
      short="Cho'l bag'ridagi qadimgi Xorazm qal'alari majmuasi.",
      text="Ayozqal'a uchta qal'adan iborat majmua bo'lib, ular turli davrlarda qurilgan. Tepalik ustidagi qal'adan Qizilqum cho'li va atrofdagi qal'alar ko'rinadi."),
]

HIST = [
 dict(id="registan-square", title="Samarqand: temuriylar merosi", city="samarqand", img="/images/registango.jpg",
      duration="1 kun (8 soat)", stops=["registon", "gur-amir", "bibixonim", "shohi-zinda"],
      desc="Registon, Go'ri Amir, Bibixonim va Shohi Zinda bo'ylab gid hamrohligidagi kunlik sayohat."),
 dict(id="khiva-old-city", title="Xiva: Ichan Qal'a sirlari", city="xiva", img="/images/khivaold.jpg",
      duration="1 kun (9 soat)", stops=["ichan-qala", "kalta-minor", "xiva-juma", "toshhovli", "pahlavon-mahmud"],
      desc="Ochiq osmon ostidagi shahar-muzey bo'ylab piyoda sayohat: saroylar, minoralar va masjidlar."),
 dict(id="ark-fortress", title="Buxoro: Ark va Poi Kalon", city="buxoro", img="/images/bukharaher.jpg",
      duration="Yarim kun (5 soat)", stops=["ark", "poi-kalon", "somoniy", "labi-hovuz"],
      desc="Buxoro tarixiy markazining asosiy obidalari bir yo'nalishda."),
 dict(id="khudoyar-palace", title="Qo'qon: xonlik poytaxti", city="qoqon", img="/images/kokand.jpg",
      duration="Yarim kun (4 soat)", stops=["xudoyorxon", "qoqon-jome", "norbotabiy", "dahmai-shohon"],
      desc="Xudoyorxon o'rdasi, Jome masjidi va xonlar dahmasi."),
 dict(id="ak-saray-palace", title="Shahrisabz: Temur vatani", city="shahrisabz", img="/images/oqsaroy.jpg",
      duration="Yarim kun (4 soat)", stops=["oqsaroy", "dorut-tilovat", "dorus-saodat"],
      desc="Oqsaroy qoldiqlari, Ko'k Gumbaz va Dorus Saodat majmuasi."),
]

# ---------------- i18n, rasmlar va yakuniy ma'lumotlar ----------------
import os, shutil, glob
from PIL import Image
from content_i18n import MON, CITY, CATS as CATS_I18N, TOUR
from content_extra import EXTRA, PATCH, YEAR_PATCH, UNESCO, UNESCO_CITY, UNESCO_MON, UNESCO_ADV
from adventures import ADV as ADV_RAW

META = json.load(open(os.path.join(BASE, "img_meta.json")))
SRC_DIR = os.environ.get("IMG_SRC", os.path.join(BASE, "_img_src"))
OUT_DIR = os.path.join(BASE, "public/images/w")
os.makedirs(OUT_DIR, exist_ok=True)

# Ko'rib chiqishda chiqarib tashlangan rasmlar (portretlar, boshqa bino, mavzuga aloqasiz)
REVIEW = json.load(open(os.path.join(BASE, "img_review.json")))
BAD = set(REVIEW["bad"])
COVER = json.load(open(os.path.join(BASE, "img_review.json")))["cover"]  # key -> birinchi bo'lib ko'rsatiladigan fayl

def imgs_for(key):
    out = []
    items = [x for x in META.get(key, []) if x["file"] not in BAD]
    if key in COVER:
        items.sort(key=lambda x: x["file"] != COVER[key])
    for x in items:
        big = os.path.join(OUT_DIR, x["file"])
        src = os.path.join(SRC_DIR, x["file"])
        if not os.path.exists(src):
            src = big  # manba papkasi bo'lmasa — public/images/w dagi tayyor nusxadan foydalanamiz
        if not os.path.exists(src):
            continue
        small = big.replace(".webp", "-s.webp")
        if not os.path.exists(big):
            shutil.copy(src, big)
        if not os.path.exists(small):
            im = Image.open(src)
            im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS).save(small, "WEBP", quality=78, method=6)
        artist = (x.get("artist") or "").replace("\n", " ").strip()
        out.append({"s": "/images/w/" + x["file"], "m": "/images/w/" + os.path.basename(small),
                    "c": dict({"a": artist[:60] or "Wikimedia Commons", "l": x["lic"], "u": x["page"]},
                              **({"k": x["kind"], "r": x.get("region")} if x.get("kind") in ("near", "city", "cityview", "map") else {}))})
    return out

def tri(uz, ru, en):
    return {"uz": uz, "ru": ru, "en": en}


MONS = []
for m in M:
    c = C[m["id"]]
    tr = MON[m["id"]]
    MONS.append(dict(
        id=m["id"], city=m["city"], cat=m["cat"], unesco=UNESCO_MON.get(m["id"], []),
        name=tri(m["name"], tr["ru"][0], tr["en"][0]),
        short=tri(m["short"], tr["ru"][1], tr["en"][1]),
        text=tri(m["text"], tr["ru"][2], tr["en"][2]),
        year=tri(m["year"], tr["ru"][3], tr["en"][3]),
        builder=tri(m["builder"], tr["ru"][4], tr["en"][4]),
        lat=round(c["lat"], 6), lng=round(c["lng"], 6), pid=c["pid"],
        imgs=imgs_for(m["id"]),
    ))
for e in EXTRA:
    MONS.append(dict(id=e["id"], city=e["city"], cat=e["cat"], unesco=UNESCO_MON.get(e["id"], []),
        **{f: tri(e["uz"][i], e["ru"][i], e["en"][i]) for i, f in enumerate(["name", "short", "text", "year", "builder"])},
        lat=e["lat"], lng=e["lng"], pid=e["pid"], imgs=imgs_for(e["id"])))
for m in MONS:
    if m["id"] in PATCH:
        p = PATCH[m["id"]]
        for i, f in enumerate(["name", "short", "text", "year", "builder"]):
            m[f] = tri(p["uz"][i], p["ru"][i], p["en"][i])
    if m["id"] in YEAR_PATCH:
        m["year"] = YEAR_PATCH[m["id"]]
# ---- Farg'ona vodiysi (turizm_obyektlari.xlsx → import_valley.py → valley.json)
VALLEY = json.load(open(os.path.join(BASE, "valley.json")))
VALLEY_CITIES = [
    dict(id="fargona", booking="fergana", lat=40.3842, lng=71.7843,
         name=tri("Farg'ona viloyati", "Ферганская область", "Fergana Region"), region=tri("Farg'ona vodiysi", "Ферганская долина", "Fergana Valley"),
         intro=tri("Marg'ilon, Rishton, Quva, So'x va boshqa tumanlardagi ziyoratgohlar, masjidlar va uy-muzeylar. Qo'qon obidalari alohida sahifada.",
                   "Святыни, мечети и дома-музеи Маргилана, Риштана, Кувы, Соха и других районов. Памятники Коканда — на отдельной странице.",
                   "Shrines, mosques and house museums of Margilan, Rishtan, Quva, Sokh and other districts. Kokand's monuments have their own page.")),
    dict(id="andijon", booking="andijan", lat=40.7821, lng=72.3442,
         name=tri("Andijon viloyati", "Андижанская область", "Andijan Region"), region=tri("Farg'ona vodiysi", "Ферганская долина", "Fergana Valley"),
         intro=tri("Andijon shahri va viloyat tumanlaridagi tarixiy masjidlar, madrasalar va ziyoratgohlar — Bobur vatanining meros obyektlari.",
                   "Исторические мечети, медресе и святыни Андижана и районов области — наследие родины Бабура.",
                   "Historic mosques, madrasahs and shrines of Andijan and its districts — the heritage of Babur's homeland.")),
    dict(id="namangan", booking="namangan", lat=41.0011, lng=71.6683,
         name=tri("Namangan viloyati", "Наманганская область", "Namangan Region"), region=tri("Farg'ona vodiysi", "Ферганская долина", "Fergana Valley"),
         intro=tri("Namangan, Chust, Pop, Chortoq va boshqa tumanlardagi maqbaralar va ziyoratgohlar.",
                   "Мавзолеи и святыни Намангана, Чуста, Папа, Чартака и других районов.",
                   "Mausoleums and shrines of Namangan, Chust, Pop, Chartak and other districts.")),
]
for v in VALLEY:
    v = {k: x for k, x in v.items() if k not in ("region", "src")}
    v["imgs"] = imgs_for(v["id"]) or v.get("imgs") or []
    MONS.append(v)

# Shahar bo'yicha tartib: avval shu shahar obidalari ketma-ket
order = [c["id"] for c in CITIES] + [c["id"] for c in VALLEY_CITIES]
MONS.sort(key=lambda m: order.index(m["city"]))
assert len({m["id"] for m in MONS}) == len(MONS)

CITIES_OUT = []
for city in CITIES:
    tr = CITY[city["id"]]
    CITIES_OUT.append(dict(
        id=city["id"], booking=city["booking"], lat=city["lat"], lng=city["lng"],
        name=tri(city["name"], tr["ru"][0], tr["en"][0]),
        region=tri(city["region"], tr["ru"][1], tr["en"][1]),
        unesco=UNESCO_CITY.get(city["id"], []),
        intro=tri(city["intro"], tr["ru"][3], tr["en"][3]),
        count=sum(1 for m in MONS if m["city"] == city["id"]),
        # Commons'dagi shahar panoramalari sifatsiz chiqdi — muqova sifatida shaharning eng tanish obidasi rasmlari
        imgs=next(m["imgs"] for m in MONS if m["id"] == REVIEW["city_from"][city["id"]]),
    ))

for vc in VALLEY_CITIES:
    CITIES_OUT.append(dict(vc, unesco=UNESCO_CITY.get(vc["id"], []), count=sum(1 for m in MONS if m["city"] == vc["id"]), imgs=imgs_for("city:" + vc["id"])))

# ---- Boshlang'ich reyting (sayt mezonlari): har bir obida baholanadi; sayyohlar ovozi qo'shilgan sari yangilanadi.
# Mezonlar: UNESCO maqomi, tarixiy davr (qadimiylik), milliy ahamiyati (taniqli obidalar ro'yxati), zamonaviy qurilish.
LANDMARK = {"registon": .5, "shohi-zinda": .5, "gur-amir": .5, "ichan-qala": .5, "poi-kalon": .45, "somoniy": .4, "ark": .35,
            "bibixonim": .35, "kalta-minor": .3, "oqsaroy": .3, "xudoyorxon": .4, "hazrati-imom": .3, "labi-hovuz": .3, "imom-buxoriy": .4,
            "ulugbek-rasadxona": .3, "bahouddin": .3, "toshhovli": .25, "islom-xoja": .25, "xiva-juma": .25, "pahlavon-mahmud": .25,
            "chor-minor": .25, "sitorai-mohi-xosa": .2, "dorus-saodat": .2, "dorut-tilovat": .2, "sulton-saodat": .2, "hakim-termiziy": .25,
            "ayozqala": .2, "afrosiyob": .25, "qoqon-jome": .25, "hazrat-xizr": .2, "xoja-doniyor": .2, "kokaldosh": .15, "shayxontohur": .15,
            "ruhobod": .1, "oqsaroy-sam": .15, "ishratxona": .1, "bibixonim-maqbara": .15, "mizdahkan": .15, "fayoztepa": .15,
            "norbotabiy": .1, "dahmai-shohon": .1, "modarixon": .1, "xoja-ahror": .1, "imom-moturidiy": .15,
            "burhoniddin-marginoniy-yodgorlik-majmuasi": .25, "jome-memoriy-majmuasi-madrasa-va-minora": .25, "qutayba-ibn-muslim": .15,
            "xoja-maoz-va-moyi-muborak-yodgorligi": .15, "jahon-otin-uvaysiy-uy-muzeyi": .1, "mavlono-lutfilloh-maqbarasi": .15}
CENT = {"registon": 15, "shohi-zinda": 11, "gur-amir": 15, "ichan-qala": 18, "poi-kalon": 12, "somoniy": 10, "ark": 16, "bibixonim": 15,
        "kalta-minor": 19, "oqsaroy": 14, "xudoyorxon": 19, "hazrati-imom": 16, "labi-hovuz": 16, "imom-buxoriy": 20, "ulugbek-rasadxona": 15,
        "bahouddin": 16, "toshhovli": 19, "islom-xoja": 20, "xiva-juma": 18, "pahlavon-mahmud": 19, "chor-minor": 19, "sitorai-mohi-xosa": 20,
        "dorus-saodat": 14, "dorut-tilovat": 14, "sulton-saodat": 10, "hakim-termiziy": 11, "ayozqala": 1, "afrosiyob": 7, "qoqon-jome": 19,
        "fayoztepa": 1, "mizdahkan": 1, "kokaldosh": 16, "shayxontohur": 14, "hazrat-xizr": 19, "xoja-doniyor": 20, "ruhobod": 14,
        "oqsaroy-sam": 15, "ishratxona": 15, "bibixonim-maqbara": 15, "abdi-darun": 15, "xoja-ahror": 15, "chorsu-sam": 18, "imom-moturidiy": 21,
        "norbotabiy": 18, "modarixon": 19, "dahmai-shohon": 19, "kamol-qozi": 19, "hamza-muzey": 19, "dasturxonchi": 19, "miyon-hazrat": 18, "rus-osiyo-bank": 20}
def base_score(m):
    sc = 3.6
    if any(UNESCO[k]["t"] == "wh" for k in m["unesco"]): sc += .6
    elif m["unesco"]: sc += .2
    c = CENT.get(m["id"]) or m.get("century")
    if c:
        sc += .3 if c <= 15 else .2 if c <= 18 else .1 if c <= 20 else -.15
    sc += LANDMARK.get(m["id"], 0)
    return round(max(3.4, min(4.9, sc)), 1)
for m in MONS:
    m["base"] = base_score(m)
    m.pop("century", None)

CATS_OUT = {k: {"name": tri(v, CATS_I18N[k][0], CATS_I18N[k][1]), "one": tri(v_one, CATS_I18N[k][2], CATS_I18N[k][3])}
            for (k, v), v_one in zip(CATS.items(), ["Ansambl", "Maqbara", "Masjid", "Madrasa", "Minora", "Saroy / qal'a", "Arxeologik", "Muzey"])}
CATS_OUT["ziyoratgoh"] = {"name": tri("Ziyoratgohlar", "Святыни", "Shrines"), "one": tri("Ziyoratgoh", "Святыня", "Shrine")}
CATS_OUT["bino"] = {"name": tri("Tarixiy binolar", "Исторические здания", "Historic buildings"), "one": tri("Tarixiy bino", "Историческое здание", "Historic building")}

TOURS_OUT = []
for h in HIST:
    tr = TOUR[h["id"]]
    TOURS_OUT.append(dict(id=h["id"], city=h["city"], stops=h["stops"],
                          title=tri(h["title"], tr["ru"][0], tr["en"][0]),
                          duration=tri(h["duration"], tr["ru"][1], tr["en"][1]),
                          desc=tri(h["desc"], tr["ru"][2], tr["en"][2])))

ADV_OUT = []
for a in ADV_RAW:
    o = {k: v for k, v in a.items() if k not in ("uz", "ru", "en", "img", "price")}
    o["unesco"] = UNESCO_ADV.get(a["id"], [])
    o["includes"] = [x for x in a["includes"] if x != "lift"]
    for f in ("title", "desc", "program"):
        o[f] = tri(a["uz"][f], a["ru"][f], a["en"][f])
    o["imgs"] = imgs_for(a["img"])
    ADV_OUT.append(o)

# ---- O'z surati yo'q obidalar: birinchi rasm — shahar/viloyatning ramziy obidasi (yorliq bilan), ikkinchisi — joylashuv xaritasi
CITY_COVER = {c["id"]: c["imgs"][0] for c in CITIES_OUT if c["imgs"]}
for m in MONS:
    if m["imgs"] and m["imgs"][0]["c"].get("k") == "map" and m["city"] in CITY_COVER:
        lm = dict(CITY_COVER[m["city"]]); lm["c"] = dict(lm["c"], k="landmark", r=m["city"])
        m["imgs"] = [lm] + m["imgs"]

DATA = dict(unesco=UNESCO, cats=CATS_OUT, cities=CITIES_OUT, monuments=MONS, tours=TOURS_OUT, adventures=ADV_OUT)
js = "/* Avtomatik yaratilgan: build_data.py. Koordinatalar: Google Maps. Rasmlar: Wikimedia Commons. */\n"
js += "window.UTH_DATA=" + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";\n"
open(os.path.join(BASE, "public/assets/js/data.js"), "w").write(js)
json.dump(DATA, open(os.path.join(BASE, "data.json"), "w"), ensure_ascii=False)
# Reyting funksiyasi uchun ruxsat etilgan obida ID'lari (server tomonda tekshiriladi)
open(os.path.join(BASE, "netlify/lib/monument-ids.mjs"), "w").write(
    "// Avtomatik yaratilgan: build_data.py\nexport const MONUMENT_IDS = new Set(" + json.dumps([m["id"] for m in MONS]) + ");\n")
miss = [m["id"] for m in MONS if not m["imgs"]] + [a["id"] for a in ADV_OUT if not a["imgs"]] + [c["id"] for c in CITIES_OUT if not c["imgs"]]
print(len(MONS), "monuments,", len(CITIES_OUT), "cities,", len(ADV_OUT), "adventures; without images:", miss)
