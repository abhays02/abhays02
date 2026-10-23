import subprocess
import unittest
from unittest.mock import patch
from xml.etree import ElementTree

from profile_stats import fetch_repositories, render_cards, summarize


def repository(language="Python", *, fork=False, private=False, owner="abhays02", stars=0):
    return {
        "owner": {"login": owner}, "private": private, "fork": fork,
        "language": language, "stargazers_count": stars,
    }


class ProfileStatsTests(unittest.TestCase):
    @patch("profile_stats.subprocess.run")
    def test_public_api_pagination_is_flattened(self, run):
        run.return_value.stdout = '[[{"name":"first"}],[{"name":"second"}]]'
        self.assertEqual(fetch_repositories(), [{"name": "first"}, {"name": "second"}])
        self.assertIn("--paginate", run.call_args.args[0])
        self.assertIn("users/abhays02/repos?type=owner&per_page=100", run.call_args.args[0])
        self.assertTrue(run.call_args.kwargs["check"])

    @patch("profile_stats.subprocess.run")
    def test_api_failure_is_not_a_success_shaped_empty_snapshot(self, run):
        run.side_effect = subprocess.CalledProcessError(1, ["gh", "api"])
        with self.assertRaises(subprocess.CalledProcessError):
            fetch_repositories()

    def test_only_public_owned_original_repos_supply_stars_and_languages(self):
        result = summarize([
            repository(stars=3), repository("JavaScript", stars=2),
            repository("Python", fork=True, stars=100),
            repository(private=True, stars=100),
            repository(owner="another-user", stars=100),
            repository(None),
        ])
        self.assertEqual(result, {
            "public": 4, "original": 3, "stars": 5,
            "languages": [("JavaScript", 1), ("Python", 1)],
        })

    def test_languages_are_ranked_by_repo_count_with_deterministic_ties(self):
        result = summarize([repository("Python"), repository("Python"), repository("JavaScript")])
        self.assertEqual(result["languages"], [("Python", 2), ("JavaScript", 1)])

    def test_cards_escape_text_and_remain_valid_xml(self):
        cards = render_cards(summarize([repository("A&B<lang>")]), "2026-01-01 00:00")
        self.assertEqual(set(cards), {"public-stats.svg", "repo-languages.svg"})
        for svg in cards.values():
            ElementTree.fromstring(svg)
        self.assertIn("A&amp;B&lt;lang&gt;", cards["repo-languages.svg"])

    def test_empty_account_is_not_a_fetch_failure(self):
        cards = render_cards(summarize([]), "2026-01-01 00:00")
        self.assertIn("No primary languages reported", cards["repo-languages.svg"])
        for svg in cards.values():
            ElementTree.fromstring(svg)

    def test_language_card_is_limited_to_five_rows(self):
        result = summarize([repository(f"Language {i}") for i in range(8)])
        self.assertEqual(len(result["languages"]), 5)


if __name__ == "__main__":
    unittest.main()
