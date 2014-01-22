# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Hôte: 127.0.0.1 (MySQL 5.1.72)
# Base de données: local_app
# Temps de génération: 2013-11-19 09:40:25 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Affichage de la table fbpages
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fbpages`;

CREATE TABLE `fbpages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL DEFAULT '',
  `fbpageid` varchar(32) DEFAULT NULL,
  `fb_app_topbanner` varchar(255) DEFAULT NULL,
  `fb_app_sidebanner` varchar(255) DEFAULT NULL,
  `fb_app_sidebanner_y` int(3) DEFAULT NULL,
  `fb_app_colorperso` char(7) DEFAULT NULL,
  `fb_app_topbanner_cssbg` enum('y','n') DEFAULT 'y',
  `fb_app_topbanner_y` int(3) DEFAULT NULL,
  `pref_lang` enum('eng','fre') NOT NULL DEFAULT 'eng',
  `pref_show_organisation` enum('y','n') NOT NULL DEFAULT 'n',
  `pref_show_graduation` enum('y','n') NOT NULL DEFAULT 'n',
  `pref_comments_insider` enum('y','n') NOT NULL DEFAULT 'n',
  `pref_comments_vacancy` enum('y','n') NOT NULL DEFAULT 'n',
  `pref_home_vacancies` enum('y','n') DEFAULT 'n',
  `pref_prompttolike` enum('y','n') NOT NULL DEFAULT 'y',
  `pref_defaultchannel` enum('y','n') NOT NULL DEFAULT 'y',
  `pref_online` enum('y','n') NOT NULL DEFAULT 'n',
  `fb_app_admins` text NOT NULL,
  `pref_media` enum('y','n') NOT NULL DEFAULT 'n',
  `pref_media_slider` enum('y','n') NOT NULL DEFAULT 'n',
  `pm_activated` enum('y','n') NOT NULL DEFAULT 'n',
  `urlid` varchar(128) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fbpageid` (`fbpageid`),
  KEY `urlid` (`urlid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Affichage de la table fbpages_discussions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fbpages_discussions`;

CREATE TABLE `fbpages_discussions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fbpage_id` int(11) NOT NULL,
  `fbpage_url_id` int(11) NOT NULL,
  `fb_comment_id` varchar(32) DEFAULT NULL,
  `extended_target` enum('y','n') NOT NULL DEFAULT 'n',
  `title` varchar(128) NOT NULL DEFAULT '',
  `body` text,
  `user_id` int(11) unsigned DEFAULT NULL,
  `anonymous` enum('y','n') NOT NULL DEFAULT 'n',
  `discussion_topic_id` int(4) unsigned DEFAULT NULL,
  `thread_count` int(4) unsigned NOT NULL DEFAULT '0',
  `prints_count` int(11) unsigned NOT NULL DEFAULT '0',
  `views_count` int(11) unsigned NOT NULL DEFAULT '0',
  `status` enum('clean','spam','ham','spammanual','deleted','chat') DEFAULT 'ham',
  `is_insightful` enum('y','n') NOT NULL DEFAULT 'n',
  `urlid` varchar(128) NOT NULL DEFAULT '',
  `modified` datetime NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fbpage_id` (`fbpage_id`),
  KEY `fbpage_url_id` (`fbpage_url_id`),
  KEY `discussion_topic_id` (`discussion_topic_id`),
  KEY `urlid_2` (`urlid`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Affichage de la table fbpages_discussions_chats
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fbpages_discussions_chats`;

CREATE TABLE `fbpages_discussions_chats` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fbpage_id` int(11) unsigned NOT NULL,
  `discussion_id` int(11) NOT NULL,
  `title` varchar(120) NOT NULL DEFAULT '',
  `description` text NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discussion_id_2` (`discussion_id`),
  KEY `fbpage_id` (`fbpage_id`),
  KEY `discussion_id` (`discussion_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Affichage de la table fbpages_discussions_chats_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fbpages_discussions_chats_users`;

CREATE TABLE `fbpages_discussions_chats_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `discussion_chat_id` int(11) unsigned NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `type` enum('insider','visitor') NOT NULL DEFAULT 'visitor',
  `connect_date` datetime DEFAULT NULL,
  `disconnect_date` datetime DEFAULT NULL,
  `connect_attempted` int(4) NOT NULL DEFAULT '0',
  `discussions_opened` int(4) NOT NULL DEFAULT '0',
  `discussions_posted` int(4) NOT NULL DEFAULT '0',
  `replies_posted` int(4) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discussion_chat_id_2` (`discussion_chat_id`,`user_id`),
  KEY `discussion_chat_id` (`discussion_chat_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



# Affichage de la table fbpages_discussions_replies
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fbpages_discussions_replies`;

CREATE TABLE `fbpages_discussions_replies` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fb_comment_id` varchar(32) DEFAULT NULL,
  `discussion_id` int(11) unsigned DEFAULT NULL,
  `parent_discussion_reply_id` int(11) unsigned DEFAULT NULL,
  `body` text,
  `user_id` int(11) unsigned DEFAULT NULL,
  `anonymous` enum('y','n') NOT NULL DEFAULT 'n',
  `thread_count` int(4) unsigned NOT NULL DEFAULT '0',
  `status` enum('clean','spam','ham','spammanual','deleted') DEFAULT 'ham',
  `modified` datetime NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `discussion_id` (`discussion_id`),
  KEY `parent_discussion_reply_id` (`parent_discussion_reply_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Affichage de la table fbpages_insiders
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fbpages_insiders`;

CREATE TABLE `fbpages_insiders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `recruiter_user_id` int(11) NOT NULL,
  `fbpage_id` int(11) NOT NULL,
  `views_count` int(11) NOT NULL DEFAULT '0',
  `prints_count` int(11) NOT NULL DEFAULT '0',
  `online` enum('y','n') NOT NULL DEFAULT 'y',
  `pushed_to_top_on` datetime DEFAULT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `recruiter_user_id` (`recruiter_user_id`,`fbpage_id`),
  KEY `pushed_to_top_on` (`pushed_to_top_on`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Affichage de la table fbpages_recruiters
# ------------------------------------------------------------

DROP TABLE IF EXISTS `fbpages_recruiters`;

CREATE TABLE `fbpages_recruiters` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fbpage_id` int(11) NOT NULL,
  `recruiter_id` int(11) NOT NULL,
  `role` enum('admin','contributor') NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`id`),
  KEY `recruiter_id` (`recruiter_id`),
  KEY `fbpage_id` (`fbpage_id`),
  KEY `couple` (`fbpage_id`,`recruiter_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Affichage de la table recruiters
# ------------------------------------------------------------

DROP TABLE IF EXISTS `recruiters`;

CREATE TABLE `recruiters` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL DEFAULT '',
  `company_id` int(11) unsigned NOT NULL,
  `address` text,
  `country_id` int(11) NOT NULL DEFAULT '189',
  `phone` varchar(32) NOT NULL DEFAULT '',
  `fax` varchar(32) NOT NULL DEFAULT '',
  `email` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `trusted` enum('y','n') NOT NULL DEFAULT 'n',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_id` (`company_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Affichage de la table recruiters_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `recruiters_users`;

CREATE TABLE `recruiters_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `recruiter_id` int(11) unsigned NOT NULL,
  `user_id` int(11) unsigned DEFAULT NULL,
  `role` enum('admin','insider') DEFAULT 'insider',
  `status` enum('awaiting','accepted','canceled','not-sent') DEFAULT 'not-sent',
  `email` varchar(255) DEFAULT NULL,
  `invitation_code` varchar(255) DEFAULT NULL,
  `referrer_user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_by_recruiter` (`recruiter_id`,`user_id`),
  KEY `user_id` (`role`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Affichage de la table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `lastname` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `birthdate` date DEFAULT NULL,
  `password` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
  `sexe` enum('male','female','unknown') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'unknown',
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `picture` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `old_import_liid` bigint(11) DEFAULT NULL,
  `yearsofexperience` smallint(2) DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8_unicode_ci,
  `zip_code` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `country_id` int(3) DEFAULT NULL,
  `town_id` int(11) DEFAULT NULL,
  `about` text COLLATE utf8_unicode_ci NOT NULL,
  `online` enum('y','n') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'y',
  `active` enum('y','n') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'n',
  `securitykey` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `group_id` int(3) NOT NULL,
  `receivemsg` enum('y','n') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'y',
  `referrer_user_id` int(11) DEFAULT NULL,
  `partner_id` int(11) DEFAULT NULL,
  `ntfoptin` enum('y','n') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'y',
  `optin` enum('y','n') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'y',
  `optout` enum('y','n') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'y',
  `fbid` bigint(11) DEFAULT NULL,
  `liid` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `filter_limit` tinyint(2) NOT NULL DEFAULT '20',
  `filter_location` tinyint(2) NOT NULL DEFAULT '1',
  `filter_contract` tinyint(2) NOT NULL DEFAULT '1',
  `urlid` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `last_action_date` datetime DEFAULT NULL,
  `last_ip` varchar(39) COLLATE utf8_unicode_ci DEFAULT NULL,
  `views_count` int(11) NOT NULL,
  `weight` float unsigned NOT NULL DEFAULT '1',
  `pmrank` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `liid` (`liid`),
  UNIQUE KEY `fbid` (`fbid`),
  UNIQUE KEY `urlid` (`urlid`),
  UNIQUE KEY `email` (`email`),
  KEY `group_id` (`group_id`),
  KEY `linkedin_profile_id` (`old_import_liid`),
  KEY `country_id` (`country_id`,`town_id`),
  KEY `partner_id` (`partner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



LOCK TABLES `fbpages` WRITE;
/*!40000 ALTER TABLE `fbpages` DISABLE KEYS */;

INSERT INTO `fbpages` (`id`, `name`, `fbpageid`, `fb_app_topbanner`, `fb_app_sidebanner`, `fb_app_sidebanner_y`, `fb_app_colorperso`, `fb_app_topbanner_cssbg`, `fb_app_topbanner_y`, `pref_lang`, `pref_show_organisation`, `pref_show_graduation`, `pref_comments_insider`, `pref_comments_vacancy`, `pref_home_vacancies`, `pref_prompttolike`, `pref_defaultchannel`, `pref_online`, `fb_app_admins`, `pref_media`, `pref_media_slider`, `pm_activated`, `urlid`, `created`, `modified`)
VALUES
  (1,'Company Demo FB Page',NULL,NULL,NULL,NULL,NULL,'y',NULL,'fre','n','n','n','n','n','y','y','y','','n','n','y','company-demo','2013-11-19 10:50:36','2013-11-19 10:50:36');

/*!40000 ALTER TABLE `fbpages` ENABLE KEYS */;
UNLOCK TABLES;


# Affichage de la table fbpages_discussions
# ------------------------------------------------------------

LOCK TABLES `fbpages_discussions` WRITE;
/*!40000 ALTER TABLE `fbpages_discussions` DISABLE KEYS */;

INSERT INTO `fbpages_discussions` (`id`, `fbpage_id`, `fbpage_url_id`, `fb_comment_id`, `extended_target`, `title`, `body`, `user_id`, `anonymous`, `discussion_topic_id`, `thread_count`, `prints_count`, `views_count`, `status`, `is_insightful`, `urlid`, `modified`, `created`)
VALUES
  (1,1,0,NULL,'n','',NULL,NULL,'n',NULL,7,0,0,'chat','n','','2013-11-19 16:33:21','2013-11-19 10:54:19');

/*!40000 ALTER TABLE `fbpages_discussions` ENABLE KEYS */;
UNLOCK TABLES;


# Affichage de la table fbpages_discussions_chats
# ------------------------------------------------------------

LOCK TABLES `fbpages_discussions_chats` WRITE;
/*!40000 ALTER TABLE `fbpages_discussions_chats` DISABLE KEYS */;

INSERT INTO `fbpages_discussions_chats` (`id`, `fbpage_id`, `discussion_id`, `title`, `description`, `start_date`, `end_date`, `modified`, `created`)
VALUES
  (1,1,1,'Mon live chat de test','Ceci est un live chat de test destiné au developpement de la solution…','2013-11-19 10:53:10','2030-12-31 23:59:59','2013-11-19 10:53:10','2013-11-19 10:53:10');

/*!40000 ALTER TABLE `fbpages_discussions_chats` ENABLE KEYS */;
UNLOCK TABLES;


# Affichage de la table fbpages_discussions_chats_users
# ------------------------------------------------------------

LOCK TABLES `fbpages_discussions_chats_users` WRITE;
/*!40000 ALTER TABLE `fbpages_discussions_chats_users` DISABLE KEYS */;

INSERT INTO `fbpages_discussions_chats_users` (`id`, `discussion_chat_id`, `user_id`, `type`, `connect_date`, `disconnect_date`, `connect_attempted`, `discussions_opened`, `discussions_posted`, `replies_posted`, `created`)
VALUES
  (4,1,6,'insider','2013-11-19 15:23:05',NULL,20,7,0,3,'2013-11-19 15:22:53'),
  (3,1,5,'visitor','2013-11-19 15:11:54',NULL,10,4,3,1,'2013-11-19 15:08:51');

/*!40000 ALTER TABLE `fbpages_discussions_chats_users` ENABLE KEYS */;
UNLOCK TABLES;


# Affichage de la table fbpages_discussions_replies
# ------------------------------------------------------------

LOCK TABLES `fbpages_discussions_replies` WRITE;
/*!40000 ALTER TABLE `fbpages_discussions_replies` DISABLE KEYS */;

INSERT INTO `fbpages_discussions_replies` (`id`, `fb_comment_id`, `discussion_id`, `parent_discussion_reply_id`, `body`, `user_id`, `anonymous`, `thread_count`, `status`, `modified`, `created`)
VALUES
  (1,NULL,1,NULL,'ma toute belle première question va-t-elle fonctionner ?',5,'n',2,'ham','2013-11-19 15:23:16','2013-11-19 15:12:29'),
  (2,NULL,1,1,'il semble que oui en tout cas :)',5,'n',0,'ham','2013-11-19 15:21:30','2013-11-19 15:21:30'),
  (3,NULL,1,1,'Bonjour!',6,'n',0,'ham','2013-11-19 15:23:16','2013-11-19 15:23:16'),
  (4,NULL,1,NULL,'Une 2eme question est-elle envisageable ?',5,'n',1,'ham','2013-11-19 15:24:54','2013-11-19 15:24:37'),
  (5,NULL,1,4,'bien sûr!',6,'n',0,'ham','2013-11-19 15:24:54','2013-11-19 15:24:54'),
  (6,NULL,1,NULL,'Hello - ceci est ma 3eme question !?',5,'n',1,'ham','2013-11-19 16:33:21','2013-11-19 16:32:59'),
  (7,NULL,1,6,'Salut !',6,'n',0,'ham','2013-11-19 16:33:21','2013-11-19 16:33:21');

/*!40000 ALTER TABLE `fbpages_discussions_replies` ENABLE KEYS */;
UNLOCK TABLES;


# Affichage de la table fbpages_insiders
# ------------------------------------------------------------

LOCK TABLES `fbpages_insiders` WRITE;
/*!40000 ALTER TABLE `fbpages_insiders` DISABLE KEYS */;

INSERT INTO `fbpages_insiders` (`id`, `recruiter_user_id`, `fbpage_id`, `views_count`, `prints_count`, `online`, `pushed_to_top_on`, `created`)
VALUES
  (1,1,1,0,0,'y','2013-11-19 10:51:50','2013-11-19 10:51:50');

/*!40000 ALTER TABLE `fbpages_insiders` ENABLE KEYS */;
UNLOCK TABLES;


# Affichage de la table fbpages_recruiters
# ------------------------------------------------------------

LOCK TABLES `fbpages_recruiters` WRITE;
/*!40000 ALTER TABLE `fbpages_recruiters` DISABLE KEYS */;

INSERT INTO `fbpages_recruiters` (`id`, `fbpage_id`, `recruiter_id`, `role`)
VALUES
  (1,1,1,'admin');

/*!40000 ALTER TABLE `fbpages_recruiters` ENABLE KEYS */;
UNLOCK TABLES;


# Affichage de la table recruiters
# ------------------------------------------------------------

LOCK TABLES `recruiters` WRITE;
/*!40000 ALTER TABLE `recruiters` DISABLE KEYS */;

INSERT INTO `recruiters` (`id`, `name`, `company_id`, `address`, `country_id`, `phone`, `fax`, `email`, `logo`, `description`, `website`, `trusted`, `created`, `modified`)
VALUES
  (1,'Company Demo',0,NULL,189,'','','root@pathmotion.com',NULL,'',NULL,'y','2013-11-19 10:49:07','2013-11-19 10:49:07');

/*!40000 ALTER TABLE `recruiters` ENABLE KEYS */;
UNLOCK TABLES;


# Affichage de la table recruiters_users
# ------------------------------------------------------------

LOCK TABLES `recruiters_users` WRITE;
/*!40000 ALTER TABLE `recruiters_users` DISABLE KEYS */;

INSERT INTO `recruiters_users` (`id`, `recruiter_id`, `user_id`, `role`, `status`, `email`, `invitation_code`, `referrer_user_id`, `created`, `modified`)
VALUES
  (1,1,1,'insider','accepted',NULL,NULL,NULL,'2013-11-19 10:51:22','2013-11-19 10:51:22');

/*!40000 ALTER TABLE `recruiters_users` ENABLE KEYS */;
UNLOCK TABLES;


# Affichage de la table users
# ------------------------------------------------------------

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `firstname`, `lastname`, `birthdate`, `password`, `sexe`, `email`, `picture`, `old_import_liid`, `yearsofexperience`, `phone`, `address`, `zip_code`, `country_id`, `town_id`, `about`, `online`, `active`, `securitykey`, `group_id`, `receivemsg`, `referrer_user_id`, `partner_id`, `ntfoptin`, `optin`, `optout`, `fbid`, `liid`, `created`, `modified`, `filter_limit`, `filter_location`, `filter_contract`, `urlid`, `last_action_date`, `last_ip`, `views_count`, `weight`, `pmrank`)
VALUES
  (5,'Victor','Levisiteur',NULL,'fe01ce2a7fbac8fafaed7c982a04e229','unknown','visitor@example.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'','y','n','650ec788b48336a8cabaa3c8742c855a',0,'y',NULL,NULL,'y','y','y',NULL,NULL,'2013-11-19 15:08:49','2013-11-19 15:08:49',20,1,1,NULL,NULL,NULL,0,1,0),
  (6,'Jason','Linsider',NULL,'fe01ce2a7fbac8fafaed7c982a04e229','unknown','insider@example.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'','y','n','0d28191ea0b543a93f8b388785985110',0,'y',NULL,NULL,'y','y','y',NULL,NULL,'2013-11-19 15:22:53','2013-11-19 15:22:53',20,1,1,NULL,NULL,NULL,0,1,0);

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
