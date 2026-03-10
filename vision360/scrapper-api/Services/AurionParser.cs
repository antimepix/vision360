using System.Text.RegularExpressions;
using scrapperPlanning.Models.Dto;

namespace scrapperPlanning.Services;

public static class AurionParser
{
    public static string? GetButtonId(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            return null;
        }

        var match = Regex.Match(
            html,
            "class=\"[^\"]*GreenButton[^\"]*\"[^>]*id=\"([^\"]+)\"",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);

        if (match.Success)
        {
            return match.Groups[1].Value;
        }

        match = Regex.Match(
            html,
            "id=\"([^\"]+)\"[^>]*class=\"[^\"]*GreenButton[^\"]*\"",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);

        return match.Success ? match.Groups[1].Value : null;
    }

    public static List<string> ExtractPlanningIdsFromXml(string xml)
    {
        const string updatePattern = "<update\\s+id=\"form:j_idt181\">\\s*<!\\[CDATA\\[(.*?)\\]\\]>\\s*</update>";
        var updateMatch = Regex.Match(xml, updatePattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);
        if (!updateMatch.Success)
        {
            return [];
        }

        var cdataContent = updateMatch.Groups[1].Value;
        const string rowPattern = "<tr[^>]*data-rk=\"(\\d+)\"[^>]*>";
        var matches = Regex.Matches(cdataContent, rowPattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);
        return matches.Select(match => match.Groups[1].Value).ToList();
    }

    public static List<StudentDto> ExtractStudentNames(string xml) =>
        ExtractTwoColumnTable(xml, "form:onglets:apprenantsTable_data")
            .Select(row => new StudentDto(row.Left, row.Right))
            .ToList();

    public static List<LecturerDto> ExtractLecturerNames(string xml) =>
        ExtractTwoColumnTable(xml, "form:onglets:j_idt173_data")
            .Select(row => new LecturerDto(row.Left, row.Right))
            .ToList();

    public static List<ResourceDto> ExtractResources(string xml) =>
        ExtractTwoColumnTable(xml, "form:onglets:j_idt165_data")
            .Select(row => new ResourceDto(row.Left, row.Right, row.Left))
            .ToList();

    public static List<GroupDto> ExtractGroups(string xml) =>
        ExtractTwoColumnTable(xml, "form:onglets:j_idt212_data")
            .Select(row => new GroupDto(row.Left, row.Right))
            .ToList();

    public static List<CourseDto> ExtractCourses(string xml)
    {
        const string tbodyPattern = "<tbody[^>]*id=\"form:onglets:j_idt220_data\"[^>]*>(.*?)</tbody>";
        var tbodyMatch = Regex.Match(xml, tbodyPattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);
        if (!tbodyMatch.Success)
        {
            return [];
        }

        var tbodyContent = tbodyMatch.Groups[1].Value;
        const string rowPattern = "<tr[^>]*>.*?<td[^>]*>([^<]+)</td>.*?<td[^>]*>([^<]+)</td>.*?<td[^>]*>([^<]+)</td>.*?</tr>";
        var matches = Regex.Matches(tbodyContent, rowPattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);
        return matches
            .Select(match => new CourseDto(
                match.Groups[1].Value.Trim(),
                match.Groups[2].Value.Trim(),
                match.Groups[3].Value.Trim()))
            .ToList();
    }

    public static List<AurionEventDto> GetUniqueEvents(List<AurionEventDto> events)
    {
        var seen = new HashSet<string>();
        return events.Where(evt => seen.Add(evt.Id)).ToList();
    }

    private static List<(string Left, string Right)> ExtractTwoColumnTable(string xml, string tbodyId)
    {
        var tbodyPattern = $"<tbody[^>]*id=\\\"{Regex.Escape(tbodyId)}\\\"[^>]*>(.*?)</tbody>";
        var tbodyMatch = Regex.Match(xml, tbodyPattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);
        if (!tbodyMatch.Success)
        {
            return [];
        }

        var tbodyContent = tbodyMatch.Groups[1].Value;
        const string rowPattern = "<tr[^>]*>.*?<td[^>]*>([^<]+)</td>.*?<td[^>]*>([^<]+)</td>.*?</tr>";
        var matches = Regex.Matches(tbodyContent, rowPattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);

        return matches
            .Select(match => (match.Groups[1].Value.Trim(), match.Groups[2].Value.Trim()))
            .ToList();
    }
}
